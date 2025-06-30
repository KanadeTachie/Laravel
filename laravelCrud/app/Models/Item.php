<?php
//NOTE: CREATED USING CLI: php artisan make:model Item

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    protected $fillable = [
        'name',
        'owner_id',
        'quantity',
        'date_deposited',
        'date_retrieved',
    ];

    public function owner_id(){
        return $this->belongsTo(User::class, 'owner_id');
    }
}
