var createSongRow = function (songNumber, songName, songLength) {
  var template =
     '<tr class="album-view-song-item">'
   + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
   + '  <td class="song-item-title">' + songName + '</td>'
   + '  <td class="song-item-duration">' + songLength + '</td>'
   + '</tr>'
   ;

   var handleSongClick = function() {
    var clickedSongNumber = $(this).attr('data-song-number')
    // 1. There is a song that is currently playing
    if (currentlyPlayingSongNumber !== null) {
      var currentlyPlayingCell = $('.song-item-number[data-song-number=' + currentlyPlayingSongNumber + ']')
      currentlyPlayingCell.html(currentlyPlayingSongNumber)
    }
  
    // 2. There is a song currently playing, but a different one was clicked to play
    if (clickedSongNumber !== currentlyPlayingSongNumber){
      currentlyPlayingSongNumber = clickedSongNumber
      // set up the new song to play
      setSong(clickedSongNumber)
      currentSoundFile.play()

      $(this).html(pauseButtonTemplate)
      $('.play-pause').html(playerPauseTemplate)
    // 3. The currently playing song was clicked
    }else {
      // currentlyPlayingSongNumber = null
      // $(this).html(clickedSongNumber)
      if(currentSoundFile.isPaused()){
        currentSoundFile.play()
        $(this).html(pauseButtonTemplate);
        $('.play-pause').html(playerPauseTemplate)
      }
      else{
        currentSoundFile.pause()
        $(this).html(playButtonTemplate);
        $('.play-pause').html(playerPlayTemplate)
      }

    }
  };
  var onHover = function () {
    var songItem = $(this).find('.song-item-number');
    var songNumber = songItem.attr('data-song-number');
  
    // if the song being hovered over isn't the one being played
    if (songNumber !== currentlyPlayingSongNumber) {
      // show the play button
      songItem.html(playButtonTemplate);
    }
  };
  
  var offHover = function () {
    var songItem = $(this).find('.song-item-number');
    var songNumber = songItem.attr('data-song-number');
  
    // if the song being hovered over isn't the one being played
    if (songNumber !== currentlyPlayingSongNumber){
      // revert back to just showing the song number
      songItem.html(songNumber);
    }
  };
  var $row = $(template);
  $row.find('.song-item-number').click(handleSongClick);
  // $('.play-pause').click(handleSongClick)
  $row.hover(onHover, offHover);
  // console.log($row.find('.song-item-number'))

  return $row;
};

var setCurrentAlbum = function(album) {
  currentAlbum = album;
  var $albumTitle = $('.album-view-title');
  var $albumArtist = $('.album-view-artist');
  var $albumReleaseInfo = $('.album-view-release-info');
  var $albumImage = $('.album-cover-art');
  var $albumSongList = $('.album-view-song-list');

  $albumTitle.text(album.title);
  $albumArtist.text(album.artist);
  $albumReleaseInfo.text(album.year + ' ' + album.label);
  $albumImage.attr('src', album.albumArtUrl);

  $albumSongList.empty();

  for (var i = 0; i < album.songs.length; i++) {
    var $songRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
    $albumSongList.append($songRow);
  }
  // var currPlaying = $('.currently-playing');
  // currPlaying.find('.song-name').text('');
  // currPlaying.find('.artist-name').text('');
  albumNumber = albums.indexOf(album)
};

var setSong = function(songNumber){
  if (currentSoundFile) {
    currentSoundFile.stop();
  }
  // var currentlyPlayingCell = $('.song-item-number[data-song-number=' + songNumber + ']')
  var url = currentAlbum.songs[songNumber - 1].audioUrl
  // console.log(songNumber)
  currentSoundFile = new buzz.sound(url, {
    formats: [ 'mp3' ],
    preload: true,
    volume: userVolume
  })
  var currPlaying = $('.currently-playing');
  currPlaying.find('.song-name').text(currentAlbum.songs[songNumber - 1].title);
  currPlaying.find('.artist-name').text(currentAlbum.artist);
  currentSoundFile.bind("durationchange", function() {
    var timer = buzz.toTimer(currentSoundFile.getDuration())
    $('.total-time').html(timer)
  })

  currentSoundFile.bind("timeupdate", function () {
    var percent = this.getPercent();
    var timer = buzz.toTimer(currentSoundFile.getTime())
    console.log(percent)
    $('.currently-playing .fill').css('width', ''+ percent + '%');
    $('.currently-playing .thumb').css('left', ''+ percent + '%');
    $('.current-time').html(timer)
});

}

$('.album-change').click(function() {
  var nextAlbumNumber = albumNumber += 1
  if(nextAlbumNumber === albums.length){
    nextAlbumNumber = 0
  }
  setCurrentAlbum(albums[nextAlbumNumber])
})

$('.play-pause').click(function() {
  // console.log($(`.album-view-song-list tr:nth-child(${currentlyPlayingSongNumber})`).find('.song-item-number'))
  if(currentSoundFile){
    let $row = $(`.album-view-song-list tr:nth-child(${currentlyPlayingSongNumber})`)
    $row.find('.song-item-number').trigger('click')
  }
  
})

$('.next').click(function(){
  let newSongNumber = 1
  // console.log(albums[albumNumber].songs.length, currentlyPlayingSongNumber)
  if(Number(currentlyPlayingSongNumber) ===albums[albumNumber].songs.length){
    newSongNumber = 1
  }
  else{
    newSongNumber = Number(currentlyPlayingSongNumber) + 1
  }
  
  let $row = $(`.album-view-song-list tr:nth-child(${newSongNumber})`)
  $row.find('.song-item-number').trigger('click')
}) 
$('.previous').click(function(){
  let newSongNumber = 1
  // console.log(albums[albumNumber].songs.length, currentlyPlayingSongNumber)
  if(Number(currentlyPlayingSongNumber) ===1){
    newSongNumber = albums[albumNumber].songs.length
  }
  else{
    newSongNumber = Number(currentlyPlayingSongNumber) - 1
  }

  let $row = $(`.album-view-song-list tr:nth-child(${newSongNumber})`)
  $row.find('.song-item-number').trigger('click')
}) 

$('.currently-playing .seek-bar').click(function(e) {
  if(currentSoundFile){
    console.log($(this).offset()['left'], "div offset from left")
    console.log($(this).width(), "div width")
    console.log(e.pageX, "mouse X position")
    var numerator = e.pageX - $(this).offset()['left']
    console.log(numerator, "numerator")
    var denominator = $(this).width()
    console.log(denominator, "denominator")
    var fractionAcrossTimeSeek = numerator / denominator
    console.log(fractionAcrossTimeSeek)
    var percentAcrossTimeSeek = fractionAcrossTimeSeek * 100
    console.log(percentAcrossTimeSeek, "%")
    currentSoundFile.setPercent(percentAcrossTimeSeek)
  }

})

$('.volume .seek-bar').click(function(e){
  
  console.log($(this).offset()['left'], "div offset from left")
  console.log($(this).width(), "div width")
  console.log(e.pageX, "mouse X position")
  var numerator = e.pageX - $(this).offset()['left']
  console.log(numerator, "numerator")
  var denominator = $(this).width()
  console.log(denominator, "denominator")
  var fractionAcrossVolumeSeek = numerator / denominator
  console.log(fractionAcrossVolumeSeek)
  var percentAcrossVolumeSeek = fractionAcrossVolumeSeek * 100
  console.log(percentAcrossVolumeSeek, "%")
  if(percentAcrossVolumeSeek < 0){
    userVolume = 0;

  }
  else{
    userVolume = Math.round(percentAcrossVolumeSeek)
  }

  if(currentSoundFile){
    currentSoundFile.setVolume(userVolume)
  }
  
  $('.volume .fill').width(userVolume + "%")
  $('.volume .thumb').css('left', ''+ userVolume + '%');
  // currentSoundFile.setPercent(percentAcrossVolumeSeek)
})


var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var currentlyPlayingSongNumber = null;
var currentSoundFile = null;
var currentAlbum = null;
var albumNumber = null

setCurrentAlbum(albums[0])

var playerPlayTemplate = '<span class="ion-play"></span>'
var playerPauseTemplate = '<span class="ion-pause"></span>'
var userVolume = 0;

// $('.seek-bar').progressbar({
//   value: 80
// });
