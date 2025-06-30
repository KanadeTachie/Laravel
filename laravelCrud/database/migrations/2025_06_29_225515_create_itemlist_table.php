<?php

//NOTE: CREATED USING CLI: php artisan make:migration create_items_table
//THEN: php artisan migrate (to migrate to the database)

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('itemlist', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedBigInteger('owner_id');
            $table->integer('quantity');
            $table->date('date deposited');
            $table->date('date_retrieved')->nullable();
            $table->timestamps();

            //foreign key constraint
            $table->foreign('owner_id')->references('id')->on('users')->onDelete('cascade');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('itemlist');
    }
};
