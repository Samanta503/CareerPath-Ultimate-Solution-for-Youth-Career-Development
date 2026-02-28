<?php

namespace App\Http\Controllers;

use App\Models\Job;
use Illuminate\Http\Request;

class JobController extends Controller
{
    public function index(Request $request)
    {
        $query = Job::query();

        // Apply search filter if provided
        if ($search = $request->search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('track', 'like', "%{$search}%");
            });
        }

        // Apply additional filters (level, type, track) if provided
        foreach (['level', 'type', 'track'] as $filter) {
            if ($value = $request->$filter && $value !== 'all') {
                $query->where($filter, $value);
            }
        }

        return response()->json($query->latest()->get());
    }

    public function show($id)
    {
        return response()->json(Job::findOrFail($id));
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'company' => 'required|string|max:255',
        ]);

        return response()->json(Job::create($request->all()), 201);
    }

    public function update(Request $request, $id)
    {
        $job = Job::findOrFail($id);
        $job->update($request->all());
        return response()->json($job);
    }

    public function destroy($id)
    {
        Job::findOrFail($id)->delete();
        return response()->json(['message' => 'Job deleted']);
    }
}