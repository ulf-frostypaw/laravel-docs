# Artisan Console

- [Introducción](#introduction)
    - [Tinker (REPL)](#tinker)
- [Writing Commands](#writing-commands)
    - [Generating Commands](#generating-commands)
    - [Command Structure](#command-structure)
    - [Closure Commands](#closure-commands)
- [Defining Input Expectations](#defining-input-expectations)
    - [Arguments](#arguments)
    - [Options](#options)
    - [Input Arrays](#input-arrays)
    - [Input Descriptions](#input-descriptions)
- [Command I/O](#command-io)
    - [Retrieving Input](#retrieving-input)
    - [Prompting For Input](#prompting-for-input)
    - [Writing Output](#writing-output)
- [Registering Commands](#registering-commands)
- [Programmatically Executing Commands](#programmatically-executing-commands)
    - [Calling Commands From Other Commands](#calling-commands-from-other-commands)
- [Signal Handling](#signal-handling)
- [Stub Customization](#stub-customization)
- [Events](#events)

<a name="introduction"></a>
## Introducción

Artisan es la interfaz de comandos incluida por defecto en Laravel. El cual, puede ser utilizado ejecutando el script `artisan`, este provee una gran variedad de comandos y que pueden ser de gran utilidad mientras construyes tu aplicación. Para ver la lista de comandos disponibles, puedes usar el comando `list`

    php artisan list

Cada comando incluye una pantalla de "ayuda", la cual muestra y describe los argumenos y opciones disponibles. Para ver la ventana de ayuda, antepone el comando con `help`:

    php help migrate

<a name="laravel-sail"></a>
#### Laravel Sail

Si usas [Laravel Sail](/docs/{{version}}/sail) como tu ambiente de desarrollo local, recuerda usar el comando `sail` en la lina de comandos para invocar los comandos de Artisan. Sail ejecutará los comandos de Artisan dentro de los contenedores de Doker de tu aplicación.

    ./sail artisan list

<a name="tinker"></a>
### Tinker (REPL)
Laravel Tinker es una poderosa REPL para el framework de Laravel, ofrecido en el paquete [PsySH](https://github.com/bobthecow/psysh)


<a name="installation"></a>
#### Instalación

Todas las aplicaciones de Laravel cluyen Tinker por defecto. De cualquier modo, puedes instalarlo usando Composer (Solo si lo eliminaste previamente de tu aplicación):

    composer require laravel/tinker

> {tip} Looking for a graphical UI for interacting with your Laravel application? Check out [Tinkerwell](https://tinkerwell.app)!

<a name="usage"></a>
#### Uso

Tinker te permite interactuar con tu aplicación completa desde la linea de comandos, incluyendo tus modelos de Eloquent, jobs, eventos y más. Para ingresar al espacio de trabajo de Tinker, escribe el comando `tinker` en Artisan

    php artisan tinker

Puedes hacer publish al archivo de configuración usando el comando `vendor:publish`:

    php artisan vendor:publish --provider="Laravel\Tinker\TinkerServiceProvider"

> {note} The `dispatch` helper function and `dispatch` method on the `Dispatchable` class depends on garbage collection to place the job on the queue. Therefore, when using tinker, you should use `Bus::dispatch` or `Queue::push` to dispatch jobs.

<a name="command-allow-list"></a>
#### Command Allow List

Tinker utiliza una lista de 'permitidos' para determinar que comandos están permitidos para correr dentro de su shell. Por defecto, puedes correr los comandos `clear-compiled`, `down`, `env`, `inspire`, `migrate`, `optimize`, y `up`. Si te gustaría permitir más comandos podrías añadirlos en el arreglo `commands` en tu archivo de configuración `tinker.php`:

    'commands' => [
        // App\Console\Commands\ExampleCommand::class,
    ],

<a name="classes-that-should-not-be-aliased"></a>
#### Clases que no pueden tener un Alias

Normalmente, automaticamente Tinker añade un alias a las clases con las que interactuaría. Sin embargo, es posible que no desees un alias en ciertas clases. Podrías listar estas clases en el arreglo de `dont_alias` en el archivo de configuración `tinker.php`:

    'dont_alias' => [
        App\Models\User::class,
    ],

<a name="writing-commands"></a>
## Escribiendo comandos

Además de los comandos que son proveidos con Artisan, podrías construir los tuyos. Los comandos son normalmente almacenados en el directorio `app/Console/Commands`; Sin embargo, eres libre de elegir donde es su carpeta de destino, así como muchos de los comandos que pueden ser cargados por Composer. 

<a name="generating-commands"></a>
### Generando comandos

Para crear un nuevo comandos, puedes usar el comando `make:command` de Artisan. Este comando creará una nueva clase de comando en el directorio `app/Console/Commands`. No te preocupes si este directorio no existe, este será creado la primera vez que ejecutes el comando `make:command` de Artisan:

    php artisan make:command SendEmails

<a name="command-structure"></a>
### Estrcutura de comandos

Antes de generar tu comandos, debes definir las propiedades adecuadas de la clase por medio de `signature` y `description`. Estas propiedades serán usadas cuando se esté mostrando tu comando en la pantalla de `list`. La propiedad `signature` tambíen te permite definir [your command's input expectations](#defining-input-expectations). El método `handle`será llamado cuando tu comando sea ejecutado. Puedes ubicar la lógica de tu comando en este método.

Veamos un comando de ejemplo. Ten en cuenta que podemos solicitar cualquier dependencía que necesitamos por medio del los metodos del comando `handle`. El [service container](/docs/{{version}}/container) de Laravel proveerá automaticamente la inyeccion de todas las dependencias asignadas que son de type-hinted en este método.
```php
    <?php

    namespace App\Console\Commands;

    use App\Models\User;
    use App\Support\DripEmailer;
    use Illuminate\Console\Command;

    class SendEmails extends Command
    {
        /**
         * The name and signature of the console command.
         *
         * @var string
         */
        protected $signature = 'mail:send {user}';

        /**
         * The console command description.
         *
         * @var string
         */
        protected $description = 'Send a marketing email to a user';

        /**
         * Create a new command instance.
         *
         * @return void
         */
        public function __construct()
        {
            parent::__construct();
        }

        /**
         * Execute the console command.
         *
         * @param  \App\Support\DripEmailer  $drip
         * @return mixed
         */
        public function handle(DripEmailer $drip)
        {
            $drip->send(User::find($this->argument('user')));
        }
    }
```

> {tip} For greater code reuse, it is good practice to keep your console commands light and let them defer to application services to accomplish their tasks. In the example above, note that we inject a service class to do the "heavy lifting" of sending the e-mails.

<a name="closure-commands"></a>
### Comandos de cierre

Los comandos de cierre proveen una alternativa para definir los comandos de consola como clases. De igual forma, las rutas de cierre son una alternativa para los controladores, piensa que los comandos de cierre son como una alternativa a los comandos de las clases pero dentro del método `commands` en tu archivo `routes/console.php` de Laravel:
```php
    /**
     * Register the closure based commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        require base_path('routes/console.php');
    }
```
Apesar de que este archivo no defina rutas HTTP, define los puntos de entrada(rutas) de la consola de tu aplicación. Dentro de este archivo, podrías definir todas tus comandos de cierre basados en la consola usando el método `Artisan::command`. El método `command` acepta dos argumantos. El [command signature](#defining-input-expectations) y un cierre que recibe los argumentos y opciones del comando:
```php

    Artisan::command('mail:send {user}', function ($user) {
        $this->info("Sending email to: {$user}!");
    });
```
El cierre está atado a la instancia de comandos subyacentes, así que tiene acceso completo a todos los métodos helper que normalmente tendrías acceso completo a la clase de comandos. 


<a name="type-hinting-dependencies"></a>
#### Depencencias Type-Hinting

además para recibir los argumentos y opciones de tus comandos, tambien los comandos de cierre podrían ser dependencias type-hint que te gustaría adquirir del [service container](/docs/{{version}}/container):

```php
    use App\Models\User;
    use App\Support\DripEmailer;

    Artisan::command('mail:send {user}', function (DripEmailer $drip, $user) {
        $drip->send(User::find($user));
    });
```

In addition to receiving your command's arguments and options, command closures may also type-hint additional dependencies that you would like resolved out of the [service container](/docs/{{version}}/container):


<a name="closure-command-descriptions"></a>
#### Descripciones de comandos de cierre

Mientras se define un cierre basado en comandos, podrías usar el método `purpose` para añadir una descripcion al comando. Esta descripción será mostrada cuando ejecutes los comandos `php artisan list` or `php artisan help`:

```php
    Artisan::command('mail:send {user}', function ($user) {
        // ...
    })->purpose('Send a marketing email to a user');
```

<a name="defining-input-expectations"></a>
## Defining Input Expectations

When writing console commands, it is common to gather input from the user through arguments or options. Laravel makes it very convenient to define the input you expect from the user using the `signature` property on your commands. The `signature` property allows you to define the name, arguments, and options for the command in a single, expressive, route-like syntax.

<a name="arguments"></a>
### Arguments

All user supplied arguments and options are wrapped in curly braces. In the following example, the command defines one required argument: `user`:

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mail:send {user}';

You may also make arguments optional or define default values for arguments:

    // Optional argument...
    mail:send {user?}

    // Optional argument with default value...
    mail:send {user=foo}

<a name="options"></a>
### Options

Options, like arguments, are another form of user input. Options are prefixed by two hyphens (`--`) when they are provided via the command line. There are two types of options: those that receive a value and those that don't. Options that don't receive a value serve as a boolean "switch". Let's take a look at an example of this type of option:

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mail:send {user} {--queue}';

In this example, the `--queue` switch may be specified when calling the Artisan command. If the `--queue` switch is passed, the value of the option will be `true`. Otherwise, the value will be `false`:

    php artisan mail:send 1 --queue

<a name="options-with-values"></a>
#### Options With Values

Next, let's take a look at an option that expects a value. If the user must specify a value for an option, you should suffix the option name with a `=` sign:

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mail:send {user} {--queue=}';

In this example, the user may pass a value for the option like so. If the option is not specified when invoking the command, its value will be `null`:

    php artisan mail:send 1 --queue=default

You may assign default values to options by specifying the default value after the option name. If no option value is passed by the user, the default value will be used:

    mail:send {user} {--queue=default}

<a name="option-shortcuts"></a>
#### Option Shortcuts

To assign a shortcut when defining an option, you may specify it before the option name and use the `|` character as a delimiter to separate the shortcut from the full option name:

    mail:send {user} {--Q|queue}

When invoking the command on your terminal, option shortcuts should be prefixed with a single hyphen:

    php artisan mail:send 1 -Q

<a name="input-arrays"></a>
### Input Arrays

If you would like to define arguments or options to expect multiple input values, you may use the `*` character. First, let's take a look at an example that specifies such an argument:

    mail:send {user*}

When calling this method, the `user` arguments may be passed in order to the command line. For example, the following command will set the value of `user` to an array with `foo` and `bar` as its values:

    php artisan mail:send foo bar

This `*` character can be combined with an optional argument definition to allow zero or more instances of an argument:

    mail:send {user?*}

<a name="option-arrays"></a>
#### Option Arrays

When defining an option that expects multiple input values, each option value passed to the command should be prefixed with the option name:

    mail:send {user} {--id=*}

    php artisan mail:send --id=1 --id=2

<a name="input-descriptions"></a>
### Input Descriptions

You may assign descriptions to input arguments and options by separating the argument name from the description using a colon. If you need a little extra room to define your command, feel free to spread the definition across multiple lines:

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mail:send
                            {user : The ID of the user}
                            {--queue : Whether the job should be queued}';

<a name="command-io"></a>
## Command I/O

<a name="retrieving-input"></a>
### Retrieving Input

While your command is executing, you will likely need to access the values for the arguments and options accepted by your command. To do so, you may use the `argument` and `option` methods. If an argument or option does not exist, `null` will be returned:

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $userId = $this->argument('user');

        //
    }

If you need to retrieve all of the arguments as an `array`, call the `arguments` method:

    $arguments = $this->arguments();

Options may be retrieved just as easily as arguments using the `option` method. To retrieve all of the options as an array, call the `options` method:

    // Retrieve a specific option...
    $queueName = $this->option('queue');

    // Retrieve all options as an array...
    $options = $this->options();

<a name="prompting-for-input"></a>
### Prompting For Input

In addition to displaying output, you may also ask the user to provide input during the execution of your command. The `ask` method will prompt the user with the given question, accept their input, and then return the user's input back to your command:

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $name = $this->ask('What is your name?');
    }

The `secret` method is similar to `ask`, but the user's input will not be visible to them as they type in the console. This method is useful when asking for sensitive information such as passwords:

    $password = $this->secret('What is the password?');

<a name="asking-for-confirmation"></a>
#### Asking For Confirmation

If you need to ask the user for a simple "yes or no" confirmation, you may use the `confirm` method. By default, this method will return `false`. However, if the user enters `y` or `yes` in response to the prompt, the method will return `true`.

    if ($this->confirm('Do you wish to continue?')) {
        //
    }

If necessary, you may specify that the confirmation prompt should return `true` by default by passing `true` as the second argument to the `confirm` method:

    if ($this->confirm('Do you wish to continue?', true)) {
        //
    }

<a name="auto-completion"></a>
#### Auto-Completion

The `anticipate` method can be used to provide auto-completion for possible choices. The user can still provide any answer, regardless of the auto-completion hints:

    $name = $this->anticipate('What is your name?', ['Taylor', 'Dayle']);

Alternatively, you may pass a closure as the second argument to the `anticipate` method. The closure will be called each time the user types an input character. The closure should accept a string parameter containing the user's input so far, and return an array of options for auto-completion:

    $name = $this->anticipate('What is your address?', function ($input) {
        // Return auto-completion options...
    });

<a name="multiple-choice-questions"></a>
#### Multiple Choice Questions

If you need to give the user a predefined set of choices when asking a question, you may use the `choice` method. You may set the array index of the default value to be returned if no option is chosen by passing the index as the third argument to the method:

    $name = $this->choice(
        'What is your name?',
        ['Taylor', 'Dayle'],
        $defaultIndex
    );

In addition, the `choice` method accepts optional fourth and fifth arguments for determining the maximum number of attempts to select a valid response and whether multiple selections are permitted:

    $name = $this->choice(
        'What is your name?',
        ['Taylor', 'Dayle'],
        $defaultIndex,
        $maxAttempts = null,
        $allowMultipleSelections = false
    );

<a name="writing-output"></a>
### Writing Output

To send output to the console, you may use the `line`, `info`, `comment`, `question`, `warn`, and `error` methods. Each of these methods will use appropriate ANSI colors for their purpose. For example, let's display some general information to the user. Typically, the `info` method will display in the console as green colored text:

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        // ...

        $this->info('The command was successful!');
    }

To display an error message, use the `error` method. Error message text is typically displayed in red:

    $this->error('Something went wrong!');

You may use the `line` method to display plain, uncolored text:

    $this->line('Display this on the screen');

You may use the `newLine` method to display a blank line:

    // Write a single blank line...
    $this->newLine();

    // Write three blank lines...
    $this->newLine(3);

<a name="tables"></a>
#### Tables

The `table` method makes it easy to correctly format multiple rows / columns of data. All you need to do is provide the column names and the data for the table and Laravel will
automatically calculate the appropriate width and height of the table for you:

    use App\Models\User;

    $this->table(
        ['Name', 'Email'],
        User::all(['name', 'email'])->toArray()
    );

<a name="progress-bars"></a>
#### Progress Bars

For long running tasks, it can be helpful to show a progress bar that informs users how complete the task is. Using the `withProgressBar` method, Laravel will display a progress bar and advance its progress for each iteration over a given iterable value:

    use App\Models\User;

    $users = $this->withProgressBar(User::all(), function ($user) {
        $this->performTask($user);
    });

Sometimes, you may need more manual control over how a progress bar is advanced. First, define the total number of steps the process will iterate through. Then, advance the progress bar after processing each item:

    $users = App\Models\User::all();

    $bar = $this->output->createProgressBar(count($users));

    $bar->start();

    foreach ($users as $user) {
        $this->performTask($user);

        $bar->advance();
    }

    $bar->finish();

> {tip} For more advanced options, check out the [Symfony Progress Bar component documentation](https://symfony.com/doc/current/components/console/helpers/progressbar.html).

<a name="registering-commands"></a>
## Registering Commands

All of your console commands are registered within your application's `App\Console\Kernel` class, which is your application's "console kernel". Within the `commands` method of this class, you will see a call to the kernel's `load` method. The `load` method will scan the `app/Console/Commands` directory and automatically register each command it contains with Artisan. You are even free to make additional calls to the `load` method to scan other directories for Artisan commands:

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');
        $this->load(__DIR__.'/../Domain/Orders/Commands');

        // ...
    }

If necessary, you may manually register commands by adding the command's class name to a `$commands` property within your `App\Console\Kernel` class. If this property is not already defined on your kernel, you should define it manually. When Artisan boots, all the commands listed in this property will be resolved by the [service container](/docs/{{version}}/container) and registered with Artisan:

    protected $commands = [
        Commands\SendEmails::class
    ];

<a name="programmatically-executing-commands"></a>
## Programmatically Executing Commands

Sometimes you may wish to execute an Artisan command outside of the CLI. For example, you may wish to execute an Artisan command from a route or controller. You may use the `call` method on the `Artisan` facade to accomplish this. The `call` method accepts either the command's signature name or class name as its first argument, and an array of command parameters as the second argument. The exit code will be returned:

    use Illuminate\Support\Facades\Artisan;

    Route::post('/user/{user}/mail', function ($user) {
        $exitCode = Artisan::call('mail:send', [
            'user' => $user, '--queue' => 'default'
        ]);

        //
    });

Alternatively, you may pass the entire Artisan command to the `call` method as a string:

    Artisan::call('mail:send 1 --queue=default');

<a name="passing-array-values"></a>
#### Passing Array Values

If your command defines an option that accepts an array, you may pass an array of values to that option:

    use Illuminate\Support\Facades\Artisan;

    Route::post('/mail', function () {
        $exitCode = Artisan::call('mail:send', [
            '--id' => [5, 13]
        ]);
    });

<a name="passing-boolean-values"></a>
#### Passing Boolean Values

If you need to specify the value of an option that does not accept string values, such as the `--force` flag on the `migrate:refresh` command, you should pass `true` or `false` as the value of the option:

    $exitCode = Artisan::call('migrate:refresh', [
        '--force' => true,
    ]);

<a name="queueing-artisan-commands"></a>
#### Queueing Artisan Commands

Using the `queue` method on the `Artisan` facade, you may even queue Artisan commands so they are processed in the background by your [queue workers](/docs/{{version}}/queues). Before using this method, make sure you have configured your queue and are running a queue listener:

    use Illuminate\Support\Facades\Artisan;

    Route::post('/user/{user}/mail', function ($user) {
        Artisan::queue('mail:send', [
            'user' => $user, '--queue' => 'default'
        ]);

        //
    });

Using the `onConnection` and `onQueue` methods, you may specify the connection or queue the Artisan command should be dispatched to:

    Artisan::queue('mail:send', [
        'user' => 1, '--queue' => 'default'
    ])->onConnection('redis')->onQueue('commands');

<a name="calling-commands-from-other-commands"></a>
### Calling Commands From Other Commands

Sometimes you may wish to call other commands from an existing Artisan command. You may do so using the `call` method. This `call` method accepts the command name and an array of command arguments / options:

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $this->call('mail:send', [
            'user' => 1, '--queue' => 'default'
        ]);

        //
    }

If you would like to call another console command and suppress all of its output, you may use the `callSilently` method. The `callSilently` method has the same signature as the `call` method:

    $this->callSilently('mail:send', [
        'user' => 1, '--queue' => 'default'
    ]);

<a name="signal-handling"></a>
## Signal Handling

The Symfony Console component, which powers the Artisan console, allows you to indicate which process signals (if any) your command handles. For example, you may indicate that your command handles the `SIGINT` and `SIGTERM` signals.

To get started, you should implement the `Symfony\Component\Console\Command\SignalableCommandInterface` interface on your Artisan command class. This interface requires you to define two methods: `getSubscribedSignals` and `handleSignal`:

```php
<?php

use Symfony\Component\Console\Command\SignalableCommandInterface;

class StartServer extends Command implements SignalableCommandInterface
{
    // ...

    /**
     * Get the list of signals handled by the command.
     *
     * @return array
     */
    public function getSubscribedSignals(): array
    {
        return [SIGINT, SIGTERM];
    }

    /**
     * Handle an incoming signal.
     *
     * @param  int  $signal
     * @return void
     */
    public function handleSignal(int $signal): void
    {
        if ($signal === SIGINT) {
            $this->stopServer();

            return;
        }
    }
}
```

As you might expect, the `getSubscribedSignals` method should return an array of the signals that your command can handle, while the `handleSignal` method receives the signal and can respond accordingly.

<a name="stub-customization"></a>
## Stub Customization

The Artisan console's `make` commands are used to create a variety of classes, such as controllers, jobs, migrations, and tests. These classes are generated using "stub" files that are populated with values based on your input. However, you may want to make small changes to files generated by Artisan. To accomplish this, you may use the `stub:publish` command to publish the most common stubs to your application so that you can customize them:

    php artisan stub:publish

The published stubs will be located within a `stubs` directory in the root of your application. Any changes you make to these stubs will be reflected when you generate their corresponding classes using Artisan's `make` commands.

<a name="events"></a>
## Events

Artisan dispatches three events when running commands: `Illuminate\Console\Events\ArtisanStarting`, `Illuminate\Console\Events\CommandStarting`, and `Illuminate\Console\Events\CommandFinished`. The `ArtisanStarting` event is dispatched immediately when Artisan starts running. Next, the `CommandStarting` event is dispatched immediately before a command runs. Finally, the `CommandFinished` event is dispatched once a command finishes executing.
