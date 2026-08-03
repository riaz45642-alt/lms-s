<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBundleRequest;
use App\Models\WorksheetBundle;
use Illuminate\Http\Request;

class WorksheetBundleController extends Controller
{
    public function index(Request $request)
    {
        return WorksheetBundle::with('creator', 'worksheets')
            ->when(! $request->user()->hasRole('admin'), fn ($query) => $query->where('is_published', true))
            ->latest()
            ->paginate(20);
    }

    public function store(StoreBundleRequest $request)
    {
        $ids = $request->validated('worksheet_ids', []);
        $bundle = WorksheetBundle::create([
            ...$request->safe()->except('worksheet_ids'),
            'created_by' => $request->user()->id,
        ]);
        $bundle->worksheets()->sync(collect($ids)->mapWithKeys(fn ($id, $position) => [$id => ['position' => $position]])->all());

        return response()->json($bundle->load('worksheets'), 201);
    }

    public function show(Request $request, WorksheetBundle $worksheetBundle)
    {
        $allowed = $worksheetBundle->is_published
            || $request->user()->hasRole('admin');
        abort_unless($allowed, 403);

        return $worksheetBundle->load('creator', 'worksheets');
    }
}
