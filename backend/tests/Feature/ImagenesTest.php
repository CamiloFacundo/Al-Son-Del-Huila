<?php

namespace Tests\Feature;

use Tests\TestCase;

class ImagenesTest extends TestCase
{
    public function test_sirve_imagenes_subidas(): void
    {
        $dir = storage_path('app/public/publicaciones');
        @mkdir($dir, 0777, true);
        $archivo = $dir . '/test_imagen.png';
        file_put_contents($archivo, 'png');

        try {
            $this->get('/storage/publicaciones/test_imagen.png')->assertOk();
            $this->get('/imagenes/publicaciones/test_imagen.png')->assertOk();
        } finally {
            @unlink($archivo);
        }
    }

    public function test_no_permite_salir_de_la_carpeta_de_imagenes(): void
    {
        foreach ([
            '/storage/publicaciones/..%2F..%2F..%2F.env',
            '/imagenes/publicaciones/..%2F..%2F..%2F.env',
            '/storage/fotos/%2e%2e%2f%2e%2e%2f%2e%2e%2f.env',
        ] as $url) {
            $res = $this->get($url);
            $this->assertNotSame(200, $res->getStatusCode(), $url);
            $this->assertStringNotContainsString('APP_KEY', (string) $res->getContent(), $url);
        }
    }
}
