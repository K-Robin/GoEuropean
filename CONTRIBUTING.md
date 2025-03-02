# Contributing to Go European
Currently, I only allow for European alternatives to be added, and no other contributions.

If you want to add a website alternative via the repo please follow these rules:
- The website alternative must be based in Europe.
- The website alternative must be a European alternative to a non-European website.
- If the website is in a language other than English, it must be set as a specificCountry

If you would rather not contribute directly to the GitHub repo, you can also fill in the form here:
(https://goeuropean.limesurvey.net/933559?lang=en)

## How to add a website alternative
1. Clone or fork the repo.
2. Create a branch named contribution/your-username
3. Add the website name JSON to the "sites" folder

For www.google.com this would become: `sites/google.json`
For calendar.google.com this would become: `sites/calendar-google.json`
Basically, remove the domain alias such as .com, .net, .org, etc.
If the prefix is www, remove it otherwise replace the dot with a hyphen.

4. Add the alternative website information to the JSON file. You can checkout the [nike alternatives](sites/nike.json) for an example on both 
country specific and non-country specific alternatives. In the sites folder we also have a few categories.
Websites like Apple Music and Youtube Music have the same alternatives so we can just reference the category, like in [Apple Music](sites/apple-music.json).
5. Run the buildMapping.js script to update the countryMapping.json file.
6. Run the buildVersions.js script to update the versions for both Firefox and Chrome (this will be changed
once FireFox supports Manifest V3).
7. Create a pull request with the following information:
- Why the alternative is a good alternative
- Proof that the website is based in Europe (can be something as simple as info on the website).

It will take time to verify and merge these as I need to run a script over them for compatability with Chrome and Firefox.
