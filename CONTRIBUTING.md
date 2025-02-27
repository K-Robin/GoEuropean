# One rule to rule them all
Currently, I only allow contributions to the countryMappings.json in the src folder.

If you want to add a website alternative to the countryMappings.json, please 
folllow these rules:
- The website alternative must be based in Europe.
- The website alternative must be a European alternative to a non-European website.
- If the website is in a language other than English, it must be set as a specificCountry

Example: the alternative is available for everyone in Europe:
```json
"chatgpt.com": {
    "alternatives": [
      {
        "url": "chat.mistral.ai",
        "name": "Mistral",
        "origin": "France"
      }
    ]
  }
```

Example: an alternative is only available for Germany and Poland
```json
"www.amazon.com": {
    "countrySpecific": {
      "Poland": {
        "url": "allegro.pl",
        "name": "Allegro",
        "origin": "Poland"
      },
      "Germany": {
        "url": "otto.de",
        "name": "Otto",
        "origin": "Germany"
      },
```

Then, create a pull request with the following information:
- Why the alternative is a good alternative
- Proof that the website is based in Europe (can be something as simple as info on the website).

It will take time to verify and merge these as I need to run a script over them for compatability with Chrome and Firefox.
