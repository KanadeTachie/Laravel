<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ItemController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'owner_id' => 'required|exists:users,id',
            'quantity' => 'required|integer|min:1',
            'date_deposited' => 'required|date',
            'date_retrieved' => 'nullable|date|after_or_equal:date_deposited',
        ]);

        Item::create($validated);

        return redirect()->back()->with('success', 'Item added successfully!');
    }

    public function update(Request $request, Item $item)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'owner_id' => 'required|exists:users,id',
            'quantity' => 'required|integer|min:1',
            'date_deposited' => 'required|date',
            'date_retrieved' => 'nullable|date|after_or_equal:date_deposited',
        ]);

        $item->update($validated);

        return redirect()->back()->with('success', 'Item updated successfully!');
    }

    public function destroy(Item $item)
    {
        $item->delete();

        return redirect()->back()->with('success', 'Item deleted successfully!');
    }

}
