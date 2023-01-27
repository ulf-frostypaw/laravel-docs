# Configuration

## Introducción

Todos los archvos de configuración para el Framework de Laravel están almacenados en el directorio `config`. Cada uno está documentado, sientete libre de esculcarlos y familiarizarte con las opciones disponibles para ti

Esos archivos de configuracion te perfiment configurar cosas como la información para la conexión a la base de datos, tu información del servidor de correo, así como otros valores de configuración básicos, como la zona horaria de su aplicación y la clave de cifrado.

## Configuración del entorno

A menudo es útil tener valores diferentes de configuración basados en el entorno donde la aplicación es ejecutada. Por ejemplo, podrías desear usar un driver de cache diferente al que utilizas normalmente al servidor de producción.

Para hacer esto pan comido, Laravel utiliza la librería [DotEnv](https://github.com/vlucas/phpdotenv) de PHP. En una nueva instalación de Laravel, el directorio principal de tu aplicación contendrá un archivo `.env.example`, el cual define las variables de entorno más comunes. Durante el proceso instalación de Laravel, este archivo es copiado automaticamente en `.env`.

Por defecto el archivo `.env` de Laravel contiene algunos valores comunes de configuración que su función puede diferir si la aplicación se ejecuta localmente o en producción de un servidor web. Estos valores se recuperan de varios archivos de configuración dentro del directorio `config` usando la funcion `env` de Laravel.

Si estás desarrollando con un equipo, tal vez desearías seguir añadiendo un archivo `.env.example` con tu aplicación. Poniendo el placeholder de los valores en el archivo de configuración, otros desarrolladores de tu equipo claramente podrían ver cuales son las variables de entorno que necesitaría tu aplicación. 

> {tip} Any variable in your `.env` file can be overridden by external environment variables such as server-level or system-level environment variables.

#### Seguridad de los archivos de entorno

Tu archivo `.env`  no debería ser incluido con el codigo fuente de tu aplicación. Tambíen, cada uno de los desalloradores/servidores que usan tu aplicacion deberían requerir una configuración de entorno diferente. Si no, esto sería un riesgo de seguridad en caso de que un intruso obtenga acceso a tu repositorio del código fuente, ya que cualquier credencial confidencial quedaría expuesta.

#### Archivos de entorno adicionales

Antes de cargar las variables de entorno de tu aplicación, Laravel determina si las variables de entorno de `APP_ENV` han sido proveídas de forma externa o si el argumento `--env` del CLI ya ha sido especificado. Si es así, Laravel, intentará comprobar si un archivo `.env.[APP_ENV]` existe. Si no es así, por defecto el archivo `.env` será cargado.

### Tipos de variables del entorno

Todas las variables de tus archivos están normalmente parseados como linea de caracteres en `.env`,  so some reserved values have been created to allow you to return a wider range of types from the `env()` function:

`.env` Valor  | `env()` Valor
------------- | -------------
true | (bool) true
(true) | (bool) true
false | (bool) false
(false) | (bool) false
empty | (string) ''
(empty) | (string) ''
null | (null) null
(null) | (null) null


Si necesitas definir una varible como un valor que contenga espacios, puedes hacerlo encerrando el valor en doble comilla:

    APP_NAME="My Application"

### Retrieving Environment Configuration

Todos las variables listadas en este archivo serán cargadas dentro de la variable `$_ENV` global de PHP y que serán llamados cuando tu aplicación reciba una solicitud. However, you may use the `env` helper to retrieve values from these variables in your configuration files. In fact, if you review the Laravel configuration files, you will notice many of the options are already using this helper:

    'debug' => env('APP_DEBUG', false),

The second value passed to the `env` function is the "default value". This value will be returned if no environment variable exists for the given key.

### Determinando el entorno actual

El entorno actual de la aplicación está determinado por la variable `APP_ENV` desde tu archivo `.env`. Puedes acceder a él mediando el metodo `environment` en el [facade](/docs/{{version}}/facades) de `App`:


```php
    use Illuminate\Support\Facades\App;

    $environment = App::environment();
```

Tambien, podrías pasar argumentos al metodo `environment` para determinar si el entorno coincide al valor dado. El método será retornado en `true` si el entorno coincide con cualquiera de los ya asignados:
```php
    if (App::environment('local')) {
        // The environment is local
    }

    if (App::environment(['local', 'staging'])) {
        // The environment is either local OR staging...
    }
```
> {tip} The current application environment detection can be overridden by defining a server-level `APP_ENV` environment variable. La detección del enotrono de la aplicación puede ser overriden definido una variable en app_env. 

## Accessando a los valores de configuración

Para acceder facilmente los valores de tu configuración, usa la función del helper `global` desde cualquier lugar de tu aplicación. La valores de configuración puede ser accesado usando la sintaxis de "dot", el cual incluye el nombre del archivo y la opción a la que desees acceder. Un valor por defecto tambien puede ser determinado y será retornado si la opción de la configuración no existe:
```php
    $value = config('app.timezone');

    // Retrieve a default value if the configuration value does not exist...
    $value = config('app.timezone', 'Asia/Seoul');
```

Para cambiar los valores de la configuración en el runtime, pasa en arreglo al helper `config`: 
```php
    config(['app.timezone' => 'America/Chicago']);
```

## Configuración de Cache

Para darle una mejora de velocidad, you should cache all of your configuration files into a single file using the `config:cache` Artisan command. This will combine all of the configuration options for your application into a single file which can be quickly loaded by the framework.

You should typically run the `php artisan config:cache` command as part of your production deployment process. The command should not be run during local development as configuration options will frequently need to be changed during the course of your application's development.

> {note} If you execute the `config:cache` command during your deployment process, you should be sure that you are only calling the `env` function from within your configuration files. Once the configuration has been cached, the `.env` file will not be loaded; therefore, the `env` function will only return external, system level environment variables.

## Modo de depuración

La opción `debug` en tu archivo de configuración `config/app.php` determina cuanta información de un error es vista normalmente por el usuario. Por defecto, esta opción es cambiada con respecto a la variable de entorno `APP_DEBUG`, la cual está alojada en tu archivo `.env`.

Para un local development, debes cambiar la variable de entorno `APP_DEBUG` a `true`. **En tu entorno de producción, este valor siempre será `false`. Si la variable es cambiada a `true` en producción, you risk exposing sensitive configuration values to your application's end users.**

## Modo mantenimiento

Cuando tu aplicación esta en modo mantenimiento, una vista personalizada será mostrada para todas las solicitudes en tu aplicación. Esto es facíl de "desactivar" mientrás tu aplicación se está actualizando o cuando estás en performing maintenance. A maintenance mode check is included in the default middleware stack for your application. If the application is in maintenance mode, a `Symfony\Component\HttpKernel\Exception\HttpException` instance will be thrown with a status code of 503.

Para habilitar el modo mantenimiento, ejecuta `down` en tu comando de Artisan:

    php artisan down

Si deseas enviar un encabezado HTTP como `Refresh` con todas las peticiones, podrías escribir la opción `refresh` cuando se está invocando el comando `down`. El encabezado `Refresh` enviará instrucciones al navegador automaticamente para actualizar la página en una determianda cantidad de segundos: 

    php artisan down --refresh=15

Tambien, podrías añadir una opción `retry` al comando `down`, el cual se cambiara como un valor `Retry-After` de encabezado HTTP, a pesar de que generalmente los navegadores lo ignoran:

    php artisan down --retry=60

#### Bypassing Maintenance Mode

Even while in maintenance mode, you may use the `secret` option to specify a maintenance mode bypass token:

    php artisan down --secret="1630542a-246b-4b66-afa1-dd72a4c43515"

After placing the application in maintenance mode, you may navigate to the application URL matching this token and Laravel will issue a maintenance mode bypass cookie to your browser:

    https://example.com/1630542a-246b-4b66-afa1-dd72a4c43515

When accessing this hidden route, you will then be redirected to the `/` route of the application. Once the cookie has been issued to your browser, you will be able to browse the application normally as if it was not in maintenance mode.

> {tip} Your maintenance mode secret should typically consist of alpha-numeric characters and, optionally, dashes. You should avoid using characters that have special meaning in URLs such as `?`.

#### Pre-Rendering The Maintenance Mode View

If you utilize the `php artisan down` command during deployment, your users may still occasionally encounter errors if they access the application while your Composer dependencies or other infrastructure components are updating. This occurs because a significant part of the Laravel framework must boot in order to determine your application is in maintenance mode and render the maintenance mode view using the templating engine.

For this reason, Laravel allows you to pre-render a maintenance mode view that will be returned at the very beginning of the request cycle. This view is rendered before any of your application's dependencies have loaded. You may pre-render a template of your choice using the `down` command's `render` option:

    php artisan down --render="errors::503"

#### Redirecting Maintenance Mode Requests

While in maintenance mode, Laravel will display the maintenance mode view for all application URLs the user attempts to access. If you wish, you may instruct Laravel to redirect all requests to a specific URL. This may be accomplished using the `redirect` option. For example, you may wish to redirect all requests to the `/` URI:

    php artisan down --redirect=/

#### Disabling Maintenance Mode

To disable maintenance mode, use the `up` command:

    php artisan up

> {tip} You may customize the default maintenance mode template by defining your own template at `resources/views/errors/503.blade.php`.

#### Maintenance Mode & Queues

While your application is in maintenance mode, no [queued jobs](/docs/{{version}}/queues) will be handled. The jobs will continue to be handled as normal once the application is out of maintenance mode.

#### Alternatives To Maintenance Mode

Since maintenance mode requires your application to have several seconds of downtime, consider alternatives like [Laravel Vapor](https://vapor.laravel.com) and [Envoyer](https://envoyer.io) to accomplish zero-downtime deployment with Laravel.
