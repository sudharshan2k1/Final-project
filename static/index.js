// Note "https://webrtchacks.com/webrtc-cv-tensorflow/";
// lt -h https://tunnel.datahub.at --port 5000

var video = null;
var streamRef = null;

var drawCanvas = null;
var drawCtx = null;

var captureCanvas = null;
var captureCtx = null;

var timeInterval = null;

var constraints = null;

var analytics = {
  "angry": 0,
  "disgust": 0,
  "fear": 0,
  "happy": 0,
  "sad": 0,
  "surprise": 0,
  "neutral": 0,
}

var adjustedCanvas = false;


function adjustCanvas(bool) {

  // check if canvas was not already adjusted
  if (!adjustedCanvas || bool) {
    // clear canvas
    drawCanvas.width = drawCanvas.width;

    drawCanvas.width = video.videoWidth || drawCanvas.width;
    drawCanvas.height = video.videoHeight || drawCanvas.height;

    captureCanvas.width = video.videoWidth || captureCanvas.width;
    captureCanvas.height = video.videoHeight || captureCanvas.height;

    drawCtx.lineWidth = "5";
    drawCtx.strokeStyle = "blue";
    drawCtx.font = "20px Verdana";
    drawCtx.fillStyle = "red";

    adjustedCanvas = true;
  }
}

function startCamera() {

  // Stop if already playing
  stopCamera();

  // Defaults
  if (constraints === null)
    constraints = { video: true, audio: false };

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function (stream) {
        video.srcObject = stream;
        streamRef = stream;
        video.play();


        timeInterval = setInterval(grab, 400);
      })
      .catch(function (err) {
        alert("Start Stream: Stream not started.");
        console.log("Start Stream:", err.name + ": " + err.message);
      });
  }
}

function updateAnalytics() {
  let labels = ['angry', 'sad', 'happy', 'fear', 'disgust', 'surprise', 'neutral'];
  labels.forEach(label => {
    document.getElementById(label).textContent = analytics[label];
  });
}
function stopInterval() {
  clearInterval(timeInterval);
}

function stopCamera() {
  // Check defaults
  if (streamRef === null) {
    console.log("Stop Stream: Stream not started/stopped.");
  }
  // Check stream
  else if (streamRef.active) {
    video.pause();
    streamRef.getTracks()[0].stop();
    video.srcObject = null;

    stopInterval();

    adjustCanvas();

    updateAnalytics();

  }
}

function downloadFrame() {
  var link = document.createElement('a');
  link.download = 'frame.jpeg';
  link.href = document.getElementById('myCanvas').toDataURL("image/jpeg", 1);
  link.click();
}

document.onreadystatechange = () => {
  if (document.readyState === "complete") {

    String.prototype.capitalize = function () {
      return this.charAt(0).toUpperCase() + this.slice(1);
    }

    video = document.querySelector("#videoElement");

    captureCanvas = document.getElementById("captureCanvas");
    captureCtx = captureCanvas.getContext("2d");

    drawCanvas = document.getElementById("drawCanvas");
    drawCtx = drawCanvas.getContext("2d");
  }
};

function grab() {
  captureCtx.drawImage(
    video,
    0,
    0,
    video.videoWidth,
    video.videoHeight,
    0,
    0,
    video.videoWidth,
    video.videoHeight,
  );
  captureCanvas.toBlob(upload, "image/jpeg");
}

function upload(blob) {
  var fd = new FormData();
  fd.append("file", blob);
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/uploade", true);
  xhr.onload = function () {
    if (this.status == 200) {
      objects = JSON.parse(this.response);

      drawBoxes(objects);
    }
  };
  xhr.send(fd);
}

function drawBoxes(objects) {
  objects.forEach(object => {
    let label = object.label;
    let score = Number(object.score);
    let x = Number(object.x);
    let y = Number(object.y);
    let width = Number(object.width);
    let height = Number(object.height);

    analytics[label] += 1;

    adjustCanvas(true);

    drawCtx.fillText(label + " - " + score, x + 5, y + 20);
    drawCtx.strokeRect(x, y, width, height);
  });
}

 var recognition;

    function StartRecord() {
      if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.start();
        recognition.onresult = function(event) {
          var result = event.results[event.resultIndex];
          if (result.isFinal) {
            document.getElementById('speak').innerHTML += result[0].transcript + '<br>';
          }
        };
        document.getElementById("stop-button").addEventListener("click", stopRecognition);
         function stopRecognition() {
          recognition.stop();
    }
      } else {
        document.getElementById('speak').innerHTML = 'Speech recognition is not supported.';
        StopRecord();
      }
    }

    function StopRecord() {
      if (recognition) {
        recognition.stop();
      }
    }



var questions = [
        "1.Tell me about Yourself?",
        "2.Explain your project?",
        "3.Explain any concept in Python?",
        "4.Why Should we hire You?",
        "5.What is your salary expectations?"
      ];

      function generateQuestion() {
        var randomIndex = Math.floor(Math.random() * questions.length);
        document.getElementById("question").innerHTML = questions[randomIndex];
      }

      $(function() {
			$('form').submit(function(event) {
				event.preventDefault();
				$.ajax({
					url: '/compile',
					type: 'POST',
					data: $(this).serialize(),
					success: function(response) {
						$('#output').text(response);
					}
				});
			});
		});

var codingQuestions = [
        "1.Write a code to Check if a Number is Positive and Negative in Python?",
        "2.Write a code to Check Whether or Not the Number is a Palindrome in Python Language?",
        "3.Write Python program for Factorial of a Number?",
        "4.Write a code to Check whether or not the number is Perfect Number in Python?",
        "5.Write a Python program to find HCF of Two Numbers?",
        "6.Write a Python program to find Prime Numbers between 1 to100.?",
        "7.Write a Python program to Reversing a Number using Recursion in Python?",
        "8.Write a Python program to check whether a number is a Strong Number or not?",
        "9.Write a Python program to find Fibonacci series up to n?",
        "10.Write a code to Check Whether the Number is Harshad or not using Python?"
      ];

      function generateQues() {
        var randomIndex = Math.floor(Math.random() * codingQuestions.length);
        document.getElementById("coding").innerHTML = codingQuestions[randomIndex];
      }