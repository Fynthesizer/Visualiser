var rotateRate = 0.05;
var currentHue = 0;
var blur = 0.75;
var bands = 2048;
var octaveBands = 3;
var minDots = 6;
var smoothing = 0.5;
var dotScale = 0.08;
var globalScale = 0.66;
var hueOffset = 40;
var mode = 1;

var cnv;

var settings, input, blurSlider, speedSlider, dotsSlider, scaleSlider, dotScaleSlider, modeSelect, playToggle;
var sound, fft, spectrum, amplitude;

var phase = 0;
var timerLength = 120;
var guiTimer = timerLength;
var showGui = true;

function preload(){
  sound = loadSound('default.mp3');
}

function setup() {
    cnv = createCanvas(windowWidth, windowHeight, P2D);
    cnv.mouseOut(mouseOut);

    angleMode(DEGREES);
    colorMode(HSB,100);
    smooth(4);
    frameRate(60);
    phase = random(10000);
    
    amplitude = new p5.Amplitude(0.9);
    fft = new p5.FFT(smoothing, bands);
    
    //GUI Panel
    settings = createDiv();
    settings.addClass("settings");
    input = createFileInput(handleFile);
    input.addClass("input");
    input.parent(settings);
    playToggle = createButton("Play");
    playToggle.mousePressed(togglePlay);
    playToggle.addClass("play");
    playToggle.parent(settings);
    blurSlider = createSlider(0,0.75,0.5,0);
    blurSlider.parent(settings);
    speedSlider = createSlider(0,0.3,0.05,0);
    speedSlider.parent(settings);
    dotsSlider = createSlider(3,10,6,1);
    dotsSlider.parent(settings);
    scaleSlider = createSlider(0.1,1,0.66,0);
    scaleSlider.parent(settings);
    dotScaleSlider = createSlider(0.02,0.1,0.08,0);
    dotScaleSlider.parent(settings);
    modeSelect = createRadio();
    modeSelect.addClass("modes");
    modeSelect.option(0,'');
    modeSelect.option(1,'');
    modeSelect.option(2,'');
    document.getElementsByClassName("modes")[0].children[2].checked = true;
    modeSelect.parent(settings);
}

function draw() {
    phase += rotateRate;
    currentHue = frameCount / 40;
    
    //Update settings
    blur = blurSlider.value();
    rotateRate = speedSlider.value();
    minDots = dotsSlider.value();
    globalScale = scaleSlider.value();
    dotScale = dotScaleSlider.value();
    mode = modeSelect.value();
    
    if (guiTimer > 0 && sound.isPlaying()) guiTimer --;
    else if (guiTimer <= 0 && showGui == true) toggleGui(false);
    
    //Background
    var bgAlpha = map(blur,0,1,100,1);
    blendMode(BLEND);
    background(58.33,31,15,bgAlpha);
    
    blendMode(ADD);
    translate(width/2,height/2);
    
    spectrum = fft.analyze(bands,null);
    var fftLog = fft.logAverages(fft.getOctaveBands(octaveBands,30));
    
    //Draw visualiser
    for (let i = 1; i < fftLog.length; i ++){
        
        var dotSize = map(fftLog[i], 0, 255, 0, height * dotScale * globalScale);
        var dotCount = i + minDots;
        
        for(j = 0; j < dotCount; j ++){
            if(mode == 0) stroke(((i * 40) + phase) % 100, 90, 100, 90);
            else if(mode == 1) stroke(((i * 99) + phase) % 100, 90, 100, 90);
            else if(mode == 2) stroke(0, 0, 100, 90);
            strokeWeight(dotSize);
            
            push();
            rotate(map(j, 0, i + minDots, 0, 360));
            rotate(phase * i);
            point(0,map(i, 0, fftLog.length, 0, (height * globalScale)));
            pop();
        }
    }
}

function togglePlay() {
  if (sound.isPlaying()) {
    sound.pause();
    playToggle.html('Play');
  } else {
    sound.loop();
    playToggle.html('Pause');
  }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function handleFile(file) {
    if (file.type === 'audio') {
        if (sound.isPlaying()) {
		  togglePlay();
        }
        sound = loadSound(file.data, fileLoaded);
    }
}

function fileLoaded() {
    togglePlay();
}

function mouseMoved(){
    guiTimer = timerLength;
    if (showGui == false) toggleGui(true);
}

function mouseDragged(){
    guiTimer = timerLength;
    if (showGui == false) toggleGui(true);
}

function mouseOut(){
    if (showGui == true && sound.isPlaying()) toggleGui(false);
}

function toggleGui(state){
    if (state == true) {
        settings.removeClass('hidden');
        cursor(ARROW);
        showGui = true;
    }
    else {
        settings.addClass('hidden');
        noCursor();
        showGui = false;
    }
}