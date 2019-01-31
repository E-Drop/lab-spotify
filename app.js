const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const SpotifyWebApi = require('spotify-web-api-node');

const clientId = '49a72ca7829b41e186c604f88a634293';
const clientSecret = 'a82e8cb1afa7409295b229ac7e9a9a26';

const spotifyApi = new SpotifyWebApi({
  clientId,
  clientSecret,
});

spotifyApi.clientCredentialsGrant()
  .then((data) => {
    spotifyApi.setAccessToken(data.body['access_token']);
  })
  .catch((error) => {
    console.log('Something went wrong when retrieving an access token', error);
  });

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/search', (req, res) => {
  res.render('search');
});

app.get('/results', (req, res) => {
  // console.log(req.query);
  const { artist } = req.query;
  if (artist === undefined || artist === '') {
    const dataToPass = {
      artists: [],
      message: 'No data',
    };
    res.render('index', dataToPass);
  } else {
    spotifyApi.searchArtists(artist)
      .then((data) => {
        const artistsArray = data.body.artists.items;
        // console.log(artistsArray[0]);
        const dataToPass = {
          artists: artistsArray,
        };
        res.render('index', dataToPass);
      })
      .catch((err) => {
        console.log('The error while searching artists occurred: ', err);
      });
  }
});

// app.post('/', (req, res) => {
//   // console.log('post', req.body);
//   // insert to db
//   // res.redirect('...')
//   res.send('post');
// });

app.get('/albums/:artistId', (req, res) => {
  const { artistId } = req.params;
  spotifyApi.getArtistAlbums(artistId)
    .then((data) => {
      const albums = data.body.items;
      res.render('albums', { albumsView: albums });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/paramtest/:id', (req, res) => {
  const { id } = req.params;
  console.log('id', id);
  console.log('query', req.query);
  res.send(`my param is ${id}`);
});

app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));
