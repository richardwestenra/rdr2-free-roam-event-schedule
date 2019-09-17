# Red Dead Online Free-Roam/Role Event Schedule

A basic webpage that shows the daily RDR2 online event timetable, and the next upcoming events. All times are in your local time zone (British Summer Time), according to your device's locale settings. Oh and it has a light/dark theme switcher too.

## Installation

It's all static vanilla HTML/CSS/JS. Clone it and run it on a local web server. I'm using [npm serve](https://www.npmjs.com/package/serve).

## Contributing

Pull requests and issues are welcome - especially if you spot a date/time that needs to be updated. The event data is stored in two arrays, at the bottom of [index.html](./index.html). Please note that all times are stored in the UTC/GMT timezone.

I've kept it to just vanilla ES5 so that I don't need to mess around with tooling, transpilation, and dependencies. I'd like to keep it that way if possible! :)

For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
