<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Dashboard', [
            'items' => Item::with('owner_id')->orderBy('created_at', 'desc')->get(),
            'users' => User::orderBy('name')->get(), // For owner selection
        ]);
    }
}

