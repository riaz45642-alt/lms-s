<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBundleRequest;
use App\Models\Worksheet;
use App\Models\WorksheetBundle;
use Illuminate\Http\Request;

class WorksheetBundleController extends Controller
{
    public function index(Request $request)
    {
        return WorksheetBundle::with('teacher.user', 'worksheets')
            ->when(! $request->user()->hasRole('teacher', 'admin'), fn ($query) => $query->where('is_published', true))
            ->latest()
            ->paginate(20);
    }

    public function store(StoreBundleRequest $request)
    {
        $teacher = $request->user()->teacherProfile;
        abort_unless($teacher, 422, 'A teacher profile is required.');

        $ids = $request->validated('worksheet_ids', []);
        abort_if(Worksheet::whereIn('id', $ids)->where('teacher_id', '!=', $teacher->id)->exists(), 422, 'Bundles may contain only your worksheets.');

        $bundle = $teacher->bundles()->create($request->safe()->except('worksheet_ids'));
        $bundle->worksheets()->sync(collect($ids)->mapWithKeys(fn ($id, $position) => [$id => ['position' => $position]])->all());

        return response()->json($bundle->load('worksheets'), 201);
    }

    public function show(Request $request, WorksheetBundle $worksheetBundle)
    {
        $allowed = $worksheetBundle->is_published
            || $request->user()->hasRole('admin')
            || ($request->user()->hasRole('teacher') && $worksheetBundle->teacher_id === $request->user()->teacherProfile?->id);
        abort_unless($allowed, 403);

        return $worksheetBundle->load('teacher.user', 'worksheets');
    }
}
