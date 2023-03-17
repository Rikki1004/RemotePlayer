import requests
import json
import time
import urllib.parse
from bs4 import BeautifulSoup
import vlc
import datetime
import threading
import os
from flask import Flask
from flask import render_template
from flask import send_from_directory
from flask import request
#from flask_cors import CORS, cross_origin
from flask import jsonify
from multiprocessing import Process


headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36'}
data = {"action": "list"}

session = requests.Session()


vlc_options = ["--fullscreen",]

instance = vlc.Instance(" ".join(vlc_options))

media_player = instance.media_player_new()
media_player.toggle_fullscreen()
media_player.audio_set_volume(80)

j = 0
film_time = 0

is_playing = False


def set_marquee():
    media_player.video_set_marquee_int(vlc.VideoMarqueeOption.Enable, 1)
    media_player.video_set_marquee_int(vlc.VideoMarqueeOption.Size, 38)
    media_player.video_set_marquee_int(vlc.VideoMarqueeOption.Color, 0xffffff)
    media_player.video_set_marquee_int(vlc.VideoMarqueeOption.Timeout, 2000)
    media_player.video_set_marquee_int(vlc.VideoMarqueeOption.Refresh, 0)

def updateTextVolume(content):
    media_player.video_set_marquee_int(vlc.VideoMarqueeOption.Position, 2)
    media_player.video_set_marquee_int(vlc.VideoMarqueeOption.Y, 0)
    media_player.video_set_marquee_int(vlc.VideoMarqueeOption.X, 40)
    media_player.video_set_marquee_string(vlc.VideoMarqueeOption.Text, str(content))

def updateTextPosition(content):
    media_player.video_set_marquee_int(vlc.VideoMarqueeOption.Y, 40)
    media_player.video_set_marquee_int(vlc.VideoMarqueeOption.X, 0)
    media_player.video_set_marquee_int(vlc.VideoMarqueeOption.Position, 8)
    media_player.video_set_marquee_string(vlc.VideoMarqueeOption.Text, str(content))


set_marquee()


def filmFinishedTr():
    global globalSerie,globalHash
    print("http://127.0.0.1:8090/stream/fname?index="+str(globalSerie)+"&play&save&link="+globalHash)
    globalSerie+=1

    media = vlc.Media("http://127.0.0.1:8090/stream/fname?index="+str(globalSerie)+"&play&save&link="+globalHash)

    media_player.set_media(media)

    media_player.play()

def filmFinished(event):
    threading.Thread(target=filmFinishedTr).start()


vlc_event_manager = media_player.event_manager()
vlc_event_manager.event_attach(vlc.EventType.MediaPlayerEndReached, filmFinished)



app = Flask(__name__,static_folder='static',)
#CORS(app)
globalName = ""
globalHash = ""
serieList = None
globalSerie = 0
position = 0


'''
def irController():
    global action
    global globalSerie, serieList, globalName, is_playing
    INPUT_WIRE = 36
    GPIO.setmode(GPIO.BOARD)
    GPIO.setup(INPUT_WIRE, GPIO.IN)
    while True:
        value = 1
        while value:
            value = GPIO.input(INPUT_WIRE)
        startTime = datetime.datetime.now()
        command = []
        numOnes = 0

        previousVal = 0
        while True:
            if value != previousVal:
                now = datetime.datetime.now()
                pulseLength = now - startTime
                startTime = now

                command.append((previousVal, pulseLength.microseconds))

            if value:
                numOnes = numOnes + 1
            else:
                numOnes = 0

            if numOnes > 10000:
                break

            previousVal = value
            value = GPIO.input(INPUT_WIRE)

        binaryString = "".join(map(lambda x: "1" if x[1] > 1000 else "0", filter(lambda x: x[0] == 1, command)))
        print(binaryString)
        try:
            if(binaryString == "100000000101111110010000011011111"): #pause
                media_player.pause()
            if(binaryString == "111100000111000001110000000011111"): #volume+
                media_player.audio_set_volume(min(100,int(media_player.audio_get_volume())+5))
                time.sleep(0.1)
            if(binaryString == "111100000111000001101000000101111"): #volume-
                media_player.audio_set_volume(max(0,int(media_player.audio_get_volume())-5))
                time.sleep(0.1)
            if(binaryString == "111100000111000001111000000001111"): #mute
                #media_player.audio_set_volume(0)
                if(media_player.audio_get_mute()):
                    media_player.audio_set_mute(False)
                else:
                    media_player.audio_set_mute(True)
                #print(media_player.audio_get_mute())

            if(binaryString == "100000000101111110000011011111001"): #stop
                media_player.stop()
                
            if(binaryString == "100000000101111110111000010001111"): #>>
                media_player.set_position(media_player.get_position() + 0.05)
            if(binaryString == "100000000101111110101101010100101"): #<<
                media_player.set_position(media_player.get_position() - 0.05)
                                
            if(binaryString == "100000000101111110001100011100111"): #ch+
                #action = "ch+"
                globalSerie = globalSerie + 1
                globalName = globalName + " -> " + str(globalSerie)

                if is_playing:
                    media_player.stop()

                media = vlc.Media(serieList[str(globalSerie)])

                media_player.set_media(media)

                media_player.play()


            if(binaryString == "100000000101111110011100011000111"): #ch-
                #action = "ch-"
                globalSerie = globalSerie - 1
                globalName = globalName + " -> " + str(globalSerie)
                #r = requests.post('http://localhost/player', json={"action": "play", "m3u": serieList[globalSerie], "name": globalName, "playlist":serieList, "ids":globalSerie})
                if is_playing:
                    media_player.stop()

                media = vlc.Media(serieList[str(globalSerie)])

                media_player.set_media(media)

                media_player.play()

            if(binaryString == "100000000101111111011000001001111"): #poweroff
                os.system('systemctl poweroff') 
        except Exception as e:
            print(e)
'''        
        
#irController()


def timeMilis(milis):
    delta = datetime.timedelta(milliseconds = milis)
    totalMinute, second = divmod(delta.seconds, 60)
    hour, minute = divmod(totalMinute, 60)
    return f"{hour}:{minute:02}:{second:02}"



@app.route("/shutdown", methods=['GET', 'POST'])
def shutdown():
    r = request.environ.get('werkzeug.server.shutdown')
    r()
    return "Shutting down..."


@app.route('/player', methods=['GET', 'POST'])
def player():
    global is_playing
    global globalName
    global serieList
    global globalSerie
    global globalHash
    req = request.json['action']
    print(req)
    if(req == "getPosition"):
        a =media_player.get_time()
        b =media_player.get_length()
        c = jsonify({"ids":str(globalSerie),"position": str(media_player.get_position() *100.0),"title": globalName,"status":str(media_player.get_state()),"time": timeMilis(a) if a != -1 else "00:00","duration":timeMilis(b) if b != -1 else "00:00" })
        action = None
        return c

    if(req == "setPosition"):
        print("pos-> ",request.json['position'])
        media_player.set_position(float(request.json['position'])/100.0)
        updateTextPosition(timeMilis(media_player.get_time())+" / "+timeMilis(media_player.get_length()))

    if(req == "getTitle"):
        return str(media_player.get_title())

    if(req == "nextFile"):
        if is_playing:
            media_player.stop()

        globalSerie+=1
        media = vlc.Media("http://127.0.0.1:8090/stream/fname?index="+str(globalSerie)+"&play&save&link="+globalHash)
        media_player.set_media(media)
        media_player.play()

    if(req == "prevFile"):
        if is_playing:
            media_player.stop()

        globalSerie-=1
        media = vlc.Media("http://127.0.0.1:8090/stream/fname?index="+str(globalSerie)+"&play&save&link="+globalHash)
        media_player.set_media(media)
        media_player.play()

    if(req == "setVolume"):
        print("posV-> ",request.json['position'])
        media_player.audio_set_volume(int(request.json['position']))
        updateTextVolume(request.json['position'])

    if(req == "getVolume"):
        return str(media_player.audio_get_volume())

    if(req == "getVolumeJson"):
        return jsonify({"volume":media_player.audio_get_volume()})

    if(req == "pause"):
        media_player.pause()
        updateTextPosition("Пауза")
        return "ok"

    if(req == "setMute"):
        if(media_player.audio_get_mute()):
            media_player.audio_set_mute(False)
            updateTextPosition("Со звуком")
        else:
            media_player.audio_set_mute(True)
            updateTextPosition("Без звука")

    if(req == "stop"):
        media_player.stop()
        film_time = 0
        globalName = ""
        
        is_playing = False
        
    if(req == "play"):
        globalName = request.json['name']
        globalSerie = int(request.json['ids']) if request.json['ids'] else None
        globalHash = request.json['hash']
        
        if is_playing:
            media_player.stop()

        media = vlc.Media(request.json['m3u'])
        media_player.set_media(media)
        media_player.play()

        updateTextPosition(globalName)

    return "ok"


@app.route('/ping', methods=['GET', 'POST'])
def ping():
    return jsonify({"ping":"pong"})

@app.route('/api', methods=['GET', 'POST'])
def api():
    req = request.args.get('req')
    if(req == "search"):
        response = None
        while(1==1):
            try:
                response = session.get('http://tsrvwc.ru/get_new.php?secret=tsrvwc&hash=&q=search/0/0/000/2/'+urllib.parse.quote_plus(request.args.get('q')),headers=headers,timeout=5)
                break
            except:
                continue
        if response.text[0:9] == "FromCache":
            body = response.text[9:]
        else:
            body = response.text

        soup = BeautifulSoup(body, 'html.parser')
        
        listAnsver = []

        table = soup.find_all('tr', {'class': ['gai', 'tum']})
        for i in table:

            children = i.find_all('td')
            childrenR = children[1].find_all('a')

            if any([x in childrenR[2].text for x in ["HDRip","WEB-DL","WEBRipA","BDRip"]]) and int(children[-1].span.text) >= 1:
                listAnsver.append({"film":childrenR[2].text,"size" : children[-2].text,"poster":"","link":childrenR[0]['href'],"magnetLink":childrenR[1]['href'],"peers":int(children[-1].span.text)})
        
        return jsonify({"data":listAnsver})
        return body
    
    return "null"

@app.route('/', methods=['GET', 'POST'])
def home():
    return render_template('index.html')

@app.route('/app')
def send_report():
    return send_from_directory('static', "film.apk")

@app.route('/ajaxDebounce.js', methods=['GET', 'POST'])
def ajax():
    return render_template('ajaxDebounce.js')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8091,)



