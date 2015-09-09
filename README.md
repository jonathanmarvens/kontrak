# Kontrak

Let's write more clean and robust JavaScript software.

## Installation

```sh
npm i kontrak
```

## Usage

```js
'use strict'

var k = require('kontrak')

console.log('' + k.contracts.string('hello')) // Yay!
console.log('' + k.contracts.string(10)) // Whoops!
console.log('' + k.contracts.number(10)) // Yay!
console.log('' + k.contracts.number('wat')) // DO YOU THINK I'M STUPID?!?
console.log('' + k.contracts.number(NaN)) // Fuck you, JavaScript. But yay!
console.log('' + k.maybe(k.contracts.string)(k.maybe.nothing())) // > Nothing
console.log('' + k.m(k.c.string)(k.m.nothing())) // > Nothing
console.log('' + k.maybe(k.contracts.string)(k.maybe.just('hello'))) // > Just(hello)
console.log('' + k.m(k.c.string)(k.m.just('hello'))) // > Just(hello)
```

## License

```
Copyright 2015 Jonathan Barronville <jonathan@belairlabs.com>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
