
function createPlaylist(_Self, _Event)
{
    if (_Event.code == "Enter")
    {
        var NewPlaylist = document.createElement("li")
        NewPlaylist.setAttribute("onclick", "showPlaylistContent(this)")
        NewPlaylist.innerHTML = _Self.value
        NewPlaylist.addEventListener('dragenter', handleDragEnter, false);
        NewPlaylist.addEventListener('dragover', handleDragOver, false);
        NewPlaylist.addEventListener('dragleave', handleDragLeave, false);
        NewPlaylist.addEventListener('drop', handleDrop, false);

        var PlaylistList = document.getElementById("playlists").getElementsByTagName("ul")[0]
        PlaylistList.append(NewPlaylist)

        setContextMenu(NewPlaylist)

        var Playlist =
        {
            "playlistName": _Self.value,
            "podcastList": []
        }

        _Self.innerHTML = s_HeartFilled
        _Self.classList.add("set-favorite")

        var JsonContent = []

        if (fs.existsSync(getPlaylistFilePath()) && fs.readFileSync(getPlaylistFilePath(), "utf-8") != "")
        {
            JsonContent = JSON.parse(fs.readFileSync(getPlaylistFilePath(), "utf-8"))
        }
        else
        {
            fs.writeFileSync(getPlaylistFilePath(), JSON.stringify(JsonContent))
        }

        JsonContent.push(Playlist)

        fs.writeFileSync(getPlaylistFilePath(), JSON.stringify(JsonContent))

        clearTextField(_Self)

    }
    else if (_Event.code == "Escape")
    {
        clearTextField(_Self)
    }
}

function loadPlaylists()
{
    var PlaylistList = document.getElementById("playlists").getElementsByTagName("ul")[0]

    if (fs.existsSync(getPlaylistFilePath()) && fs.readFileSync(getPlaylistFilePath(), "utf-8") != "")
    {
        JsonContent = JSON.parse(fs.readFileSync(getPlaylistFilePath(), "utf-8"))

        for (var i = 0; i < JsonContent.length; i++)
        {

            var PlaylistEntry = document.createElement("li")
            PlaylistEntry.setAttribute("onclick", "showPlaylistContent(this)")
            PlaylistEntry.innerHTML = JsonContent[i].playlistName
            PlaylistEntry.addEventListener('dragenter', handleDragEnter, false);
            PlaylistEntry.addEventListener('dragover', handleDragOver, false);
            PlaylistEntry.addEventListener('dragleave', handleDragLeave, false);
            PlaylistEntry.addEventListener('drop', handleDrop, false);

            setContextMenu(PlaylistEntry)

            PlaylistList.append(PlaylistEntry)
        }
    }
}

function setContextMenu(_Object)
{
    const {remote}         = require('electron')
    const {Menu, MenuItem} = remote
    const ContextMenu      = new Menu()

    ContextMenu.append(new MenuItem({label: 'Rename', click(self)
    {
        var PlaylistName = _Object.innerHTML

        console.log(self);
        console.log(PlaylistName);
    }}))
    ContextMenu.append(new MenuItem({type: 'separator'}))
    ContextMenu.append(new MenuItem({label: 'Remove Playlist: ' + _Object.innerHTML, click(self)
    {
        var PlaylistName = _Object.innerHTML
        var JsonContent  = JSON.parse(fs.readFileSync(getPlaylistFilePath(), "utf-8"))

        for (var i = 0; i < JsonContent.length; i++)
        {
            if (PlaylistName == JsonContent[i].playlistName)
            {
                JsonContent.splice(i, 1)
                break
            }
        }

        fs.writeFileSync(getPlaylistFilePath(), JSON.stringify(JsonContent))

        location.reload()
    }}))

    _Object.addEventListener('contextmenu', (_Event) =>
    {
        _Event.preventDefault()
        ContextMenu.popup(remote.getCurrentWindow())
    }, false)
}

function getPlaylist(_Name)
{
    // TODO: load podcasts associated with this playlist
}

function showPlaylistContent(_Self)
{
    clearContent()
    clearMenuSelection()
    clearTextField(document.getElementById("search").getElementsByTagName("input")[0])
    setHeader(_Self.innerHTML)
    _Self.classList.add("selected")

    var JsonContent = JSON.parse(fs.readFileSync(getPlaylistFilePath(), "utf-8"))

    for (var i = 0; i < JsonContent.length; i++)
    {
        if (_Self.innerHTML == JsonContent[i].playlistName)
        {
            // console.log(JsonContent[i].playlistName);
            // console.log(JsonContent[i].podcastList);

            if (fs.existsSync(getNewEpisodesSaveFilePath()) && fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8") != "")
            {
                var NewEpisodesJsonContent = JSON.parse(fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8"))
                var List                   = document.getElementById("list")

                for (var a = 0; a < NewEpisodesJsonContent.length; a++)
                {
                    var Artwork = getValueFromFile(getSaveFilePath, "artworkUrl60", "collectionName", NewEpisodesJsonContent[a].channelName)

                    if (getValueFromFile(getSaveFilePath, "artworkUrl100", "collectionName", NewEpisodesJsonContent[a].channelName) != undefined && getValueFromFile(getSaveFilePath, "artworkUrl100", "collectionName", NewEpisodesJsonContent[a].channelName) != "undefined")
                    {
                        Artwork = getValueFromFile(getSaveFilePath, "artworkUrl100", "collectionName", NewEpisodesJsonContent[a].channelName)
                    }

                    if (Artwork != null)
                    {
                        var ListElement = getPodcastElement(null, Artwork, NewEpisodesJsonContent[a].channelName, NewEpisodesJsonContent[a].episodeTitle, s_DeleteIcon)

                        if (isPlaying(NewEpisodesJsonContent[a].episodeUrl))
                        {
                            ListElement.classList.add("select-episode")
                        }

                        var HeaderElement = ListElement.getElementsByClassName("podcast-entry-header")[0]

                        HeaderElement.setAttribute("onclick", "playNow(this)")
                        HeaderElement.setAttribute("type", NewEpisodesJsonContent[a].episodeType)
                        HeaderElement.setAttribute("url", NewEpisodesJsonContent[a].episodeUrl)
                        HeaderElement.setAttribute("length", NewEpisodesJsonContent[a].episodeLength)
                        HeaderElement.setAttribute("artworkUrl", Artwork)

                        // NOTE: show just episodes of the playlist saved podcast

                        for (var j = 0; j < JsonContent[i].podcastList.length; j++)
                        {
                            if (NewEpisodesJsonContent[a].channelName == JsonContent[i].podcastList[j])
                            {
                                List.append(ListElement)
                                break
                            }
                        }
                    }
                }
            }

            break
        }
    }
}
