<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreWorksheetRequest;
use App\Models\Worksheet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class WorksheetController extends Controller
{
    public function index(Request $request)
    {
        $query = Worksheet::query()->with('teacher.user');

        if (! $request->user()->hasRole('teacher', 'admin')) {
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
        $teacher = $request->user()->teacherProfile;
        abort_unless($teacher, 422, 'A teacher profile is required.');

        $file = $request->file('file');
        $worksheet = $teacher->worksheets()->create([
            ...$request->safe()->except('file'),
            'file_path' => $file->store('worksheets'),
            'original_filename' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
        ]);

        return response()->json($worksheet->load('teacher.user'), 201);
    }

    public function show(Request $request, Worksheet $worksheet)
    {
        $this->authorizeView($request, $worksheet);

        return $worksheet->load('teacher.user', 'bundles');
    }

    public function download(Request $request, Worksheet $worksheet)
    {
        $this->authorizeView($request, $worksheet);
        abort_unless(Storage::exists($worksheet->file_path), 404);

        return Storage::download($worksheet->file_path, $worksheet->original_filename);
    }

    public function destroy(Request $request, Worksheet $worksheet)
    {
        abort_unless($request->user()->hasRole('admin') || $worksheet->teacher_id === $request->user()->teacherProfile?->id, 403);
        abort_if($worksheet->assignments()->exists(), 409, 'Assigned worksheets cannot be deleted.');

        Storage::delete($worksheet->file_path);
        $worksheet->delete();

        return response()->noContent();
    }

    private function authorizeView(Request $request, Worksheet $worksheet): void
    {
        $allowed = $worksheet->is_published
            || $request->user()->hasRole('admin')
            || ($request->user()->hasRole('teacher') && $worksheet->teacher_id === $request->user()->teacherProfile?->id);

        abort_unless($allowed, 403);
    }
}
