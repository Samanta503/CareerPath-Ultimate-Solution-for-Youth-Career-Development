<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    public function render($request, Throwable $exception)
    {
        // Let Laravel handle validation errors normally (422)
        if ($exception instanceof ValidationException) {
            return parent::render($request, $exception);
        }

        // Let Laravel handle auth errors normally (401)
        if ($exception instanceof AuthenticationException) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Let Laravel handle HTTP exceptions (404, 403, etc.)
        if ($exception instanceof HttpException) {
            return parent::render($request, $exception);
        }

        // For API requests, return JSON error
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'error' => true,
                'message' => config('app.debug') ? $exception->getMessage() : 'An unexpected error occurred',
            ], 500);
        }

        return parent::render($request, $exception);
    }
}
