// Written in ES5 so that it'll work in older browsers without transpilation.
// Probably unnecessary but whatever, don't @ me

(function() {
  var timezone = getTimezone();

  // Frequency in minutes
  var eventFrequency = {
    freeRoam: 45,
    role: 90
  };

  // Select DOM elements
  var elements = {
    freeRoam: {
      container: document.getElementById('free-roam-schedule'),
      nextEventName: document.getElementById('next-fr-event-name'),
      nextEventTime: document.getElementById('next-fr-event-time'),
      nextEventEta: document.getElementById('next-fr-event-eta')
    },
    role: {
      container: document.getElementById('role-schedule'),
      nextEventName: document.getElementById('next-role-event-name'),
      nextEventTime: document.getElementById('next-role-event-time'),
      nextEventEta: document.getElementById('next-role-event-eta')
    },
    locale: document.getElementById('locale')
  };

  /**
   * Update the list of event times
   * @param {array} data The list of event times
   * @param {string} key Property key (either freeRoam/role)
   */
  function updateList(data, key) {
    var el = elements[key];
    var frequency = minutesToMilliseconds(eventFrequency[key]);
    var list = document.createElement('ul');

    data.map(function(t, i) {
        return calculateEventTimes(t, i + 1, frequency);
      })
      .sort(function(a, b) {
        // Start the list at midnight regardless of the user's timezone
        return (a.timeNumber - b.timeNumber);
      })
      .forEach(function(event) {
        var li = document.createElement('li');
        if (event.isNext) {
          li.classList.add('next-event');
          el.nextEventName.innerHTML = event.name;
          el.nextEventTime.innerHTML = event.timeString;
          el.nextEventEta.innerHTML = event.etaText;
        }
        li.append(getAnchor(key.toLowerCase() + event.id));
        var text = document.createElement('span');
        text.innerText = event.timeString + ' - ' + event.name;
        li.append(text);
        li.append(getFormLink(event, key, event.id));
        list.append(li);
      });
    el.container.innerHTML = list.outerHTML;
  }

  /**
   * Create an anchor link
   * @param {Object} event Event datum
   * @param {string} key Property key (either freeRoam/role)
   * @param {string} id Unique identifier
   * @return {Node} anchor link element
   */
  function getFormLink(event, key, id) {
    var anchor = document.createElement('a');
    anchor.setAttribute('target', '_blank');
    var eventType = {
      freeRoam: 'Free-roam+event',
      role: 'Role+event'
    };
    var qsValues = {
      'entry.1897203079': eventType[key],
      'entry.1753454597': timezone,
      'entry.1235834234': event.timeString,
      'entry.1278810820': event.utcTimeString,
      'entry.698549775': event.name,
      'entry.988863521': String(id)
    };
    var queryString = Object.keys(qsValues)
      .map(function(qsKey) {
        return [qsKey, qsValues[qsKey].replace(/\s/g, '+')].join('=');
      })
      .join('&');
    var url =
      'https://docs.google.com/forms/d/e/1FAIpQLSeaEdri09zJXnLksx4icLAY70tWGGDqyuPvaQZQMnc4R9R9ag/viewform?usp=pp_url&' +
      queryString;
    anchor.setAttribute('href', url);
    anchor.className = 'form-link';
    anchor.innerText = 'Submit correction';
    anchor.setAttribute('title', 'Incorrect time? Send me correct details and I\'ll update it.');
    return anchor;
  }

  /**
   * Create an anchor link
   * @param {string} id Unique identifier
   * @return {Node} anchor link element
   */
  function getAnchor(id) {
    var anchor = document.createElement('a');
    anchor.setAttribute('id', id);
    anchor.className = 'anchor';
    anchor.setAttribute('href', '#' + id);
    anchor.innerText = '#';
    return anchor;
  }

  /**
   * Convert minutes to milliseconds
   * @param {number} t Time in minutes
   * @return {number} Time in milliseconds
   */
  function minutesToMilliseconds(t) {
    return t * 60 * 1000;
  }

  /**
   * Format the event datum and perform time-zone calculations
   * @param {Array} d Event datum containing time and name
   * @return {Object} Formatted event datum
   */
  function calculateEventTimes(d, id, frequency) {
    var eventTime = d[0];
    var now = Date.now();
    var oneDay = minutesToMilliseconds(24 * 60);
    var dateTime = getDateTime(now, eventTime);
    var eta = dateTime - now;
    // Ensure that event dates are not in the past or too far
    // in the future, where timezone is not UTC
    if (eta > frequency) {
      dateTime = getDateTime(now - oneDay, eventTime);
      eta = dateTime - now;
    }
    if (eta <= 0) {
      dateTime = getDateTime(now + oneDay, eventTime);
      eta = dateTime - now;
    }
    return {
      id: id,
      dateTime: dateTime,
      name: d[1],
      eta: eta,
      etaText: getEtaText(eta),
      isNext: eta > 0 && eta <= frequency,
      timeString: dateTime.toLocaleTimeString('default', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      timeNumber: (dateTime.getHours() * 60 + dateTime.getMinutes()),
      utcTimeString: eventTime
    };
  }

  /**
   * Get the Date object for an event
   * @param {number} date Timestamp, e.g. Date.now()
   */
  function getDateTime(date, eventTime) {
    return new Date(
      [new Date(date).toDateString(), eventTime, 'UTC'].join(' ')
    );
  }

  /**
   * Display time remaining in minutes or seconds
   * @param {number} t Time in milliseconds
   * @return {string} e.g. 1 minute, 35 minutes, 1 second, 40 seconds, etc.
   */
  function getEtaText(t) {
    t = t / 1000; // convert to seconds
    function s(t) {
      return Math.abs(t) === 1 ? '' : 's';
    }
    if (Math.abs(t) < 60) {
      return Math.round(t) + ' second' + s(t);
    }
    t = Math.round(t / 60); // convert to minutes
    return t + ' minute' + s(t);
  }

  /**
   * Get the name or abbreviation for the user's time zone
   * @return {string} e.g. GMT or Greenwich Mean Time or UTC+5
   */
  function getTimezone() {
    var date = new Date();
    // Generate long time-zone name
    var longTimeZone = date.toString().match(/\((.+)\)/);
    if (longTimeZone) {
      return longTimeZone[1];
    }
    // Fall back to short code if that one is null
    var shortTimeZone = date
      .toLocaleTimeString('en-us', { timeZoneName: 'short' })
      .split(' ');
    if (shortTimeZone) {
      return shortTimeZone[2];
    }
    // Finally, fall back to time-zone offset
    var timeZoneOffset = date.getTimezoneOffset() / -60;
    if (timeZoneOffset > 0) {
      timeZoneOffset = '+' + timeZoneOffset;
    }
    return 'GMT' + timeZoneOffset;
  }

  /**
   * Update the user's time zone in intro paragraph
   */
  function showTimeZone() {
    elements.locale.innerText = ' (' + timezone + ')';
  }

  /**
   * Format API data
   */
  function formatAPIData(data) {
    return Object.keys(data).map(function(time) {
      return [
        time,
        data[time].name
          .replace(/fme_|role_/g, '')
          .replace(/_/g,' ')
          .replace(/\b\w/g , function(m){
            return m.toUpperCase();
          })
      ]
    });
  }

  /**
   * Update both lists
   */
  function update(data) {
    updateList(data.freeRoam, 'freeRoam');
    updateList(data.role, 'role');
  }

  function initialise(data) {
    update(data);
    // Update event list every 10 seconds
    window.setInterval(update.bind(this, data), 10000);
  }

  /**
   * Fetch API data, and fall back to hard-coded data on error
   */
  function requestAPIData() {
    fetch('https://api.rdo.gg/fme/')
      .then(function(response) {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json();
      })
      .then(function(data) {
        // Modify API data into expected schema
        initialise({
          freeRoam: formatAPIData(data.default),
          role: formatAPIData(data.themed)
        })
      })
      .catch(function(error) {
        console.error(error);
        // Fall back to hard-coded list if fetch has been unsuccessful
        initialise({
          freeRoam: window.rdoEvents.freeRoam,
          role: window.rdoEvents.role
        })
      })
  }

  // Initialise
  showTimeZone();
  requestAPIData();
})();

//--- Theme switcher ---//
(function() {
  var localStorageKey = 'rdr2-event-schedule-theme';
  var THEMES = ['dark', 'light'];
  var themeButton = document.querySelector('#theme');
  // Detect localstorage value and use that if it exists
  var currentTheme = localStorage.getItem(localStorageKey) || THEMES[0];
  updateTheme(currentTheme);

  function updateTheme(theme, updateStorage) {
    THEMES.forEach(function(d) {
      document.body.classList.remove(d);
    });
    document.body.classList.add(theme);
    if (updateStorage) {
      localStorage.setItem(localStorageKey, theme);
    }
    currentTheme = theme;
  }

  // Toggle theme on button click
  themeButton.addEventListener('click', function() {
    var newTheme = THEMES[0] === currentTheme ? THEMES[1] : THEMES[0];
    updateTheme(newTheme, true);
  });
})();


//--- Toggle news ---//
(function() {
  var localStorageKey = 'rdr2-event-schedule-news';
  var newsContainer = document.querySelector('#news');
  var newsButton = newsContainer.querySelector('#toggle-news');
  var newsLi = newsContainer.querySelectorAll('li:not(:first-child)');

  // Detect localstorage value and use that if it exists
  var showNews = getLocalStorageValue();
  toggleNews();

  function getLocalStorageValue() {
    var value = localStorage.getItem(localStorageKey);
    return value && value === 'true' ? true : false;
  }

  function toggleNews() {
    newsLi.forEach(function(node) {
      node.classList.toggle('hide', !showNews);
    });
    newsButton.innerText = showNews ? 'hide' : 'show all';
  }

  // Toggle news visibility on button click
  newsButton.addEventListener('click', function(event) {
    showNews = !showNews;
    toggleNews();
    localStorage.setItem(localStorageKey, showNews);
    event.preventDefault();
  });
})();