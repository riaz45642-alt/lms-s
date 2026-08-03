<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreWorksheetRequest;
use App\Http\Requests\UpdateWorksheetRequest;
use App\Models\Worksheet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class WorksheetController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Worksheet::class);
        $user = $request->user();
        $query = Worksheet::query()->with('creator');

        if ($user->hasRole('teacher')) {
            $query->whereHas('assignments.student.teachers', fn ($q) => $q->whereKey($user->teacherProfile?->id));
        } elseif ($user->hasRole('student')) {
            $query->whereHas('assignments', fn ($q) => $q->where('student_id', $user->studentProfile?->id));
        } elseif ($user->hasRole('parent')) {
            $query->where('is_published', true);
        }

        return $query
            ->when($request->string('subject')->toString(), fn ($q, $subject) => $q->where('subject', $subject))
            ->when($request->string('grade_level')->toString(), fn ($q, $grade) => $q->where('grade_level', $grade))
            ->latest()
            ->paginate(20);
    }

    public function store(StoreWorksheetRequest $request)
    {
        $this->authorize('create', Worksheet::class);

        $file = $request->file('file');
        $worksheet = Worksheet::create([
            ...$request->safe()->except('file'),
            'created_by' => $request->user()->id,
            'file_path' => $file->store('worksheets'),
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
        ]);

        return response()->json($worksheet->load('creator'), 201);
    }

    public function show(Request $request, Worksheet $worksheet)
    {
        $this->authorize('view', $worksheet);

        return $worksheet->load('creator', 'bundles');
    }

    public function download(Request $request, Worksheet $worksheet)
    {
        $this->authorize('view', $worksheet);
        abort_unless(Storage::exists($worksheet->file_path), 404);

        return Storage::download($worksheet->file_path, $worksheet->original_filename);
    }

    public function destroy(Request $request, Worksheet $worksheet)
    {
        $this->authorize('delete', $worksheet);
        abort_if($worksheet->assignments()->exists(), 409, 'Assigned worksheets cannot be deleted.');

        Storage::delete($worksheet->file_path);
        $worksheet->delete();

        return response()->noContent();
    }

    public function update(UpdateWorksheetRequest $request, Worksheet $worksheet)
    {
        $this->authorize('update', $worksheet);
        $data = $request->safe()->except('file');
        $newFile = $request->file('file');
        $oldPath = $worksheet->file_path;

        if ($newFile) {
            $data = [
                ...$data,
                'file_path' => $newFile->store('worksheets'),
                'original_filename' => $newFile->getClientOriginalName(),
                'mime_type' => $newFile->getMimeType(),
                'file_size' => $newFile->getSize(),
            ];
        }

        try {
            $worksheet->update($data);
        } catch (\Throwable $exception) {
            if ($newFile) {
                Storage::delete($data['file_path']);
            }
            throw $exception;
        }

        if ($newFile && $oldPath !== $data['file_path']) {
            Storage::delete($oldPath);
        }

        return $worksheet->fresh()->load('creator');
    }
}
