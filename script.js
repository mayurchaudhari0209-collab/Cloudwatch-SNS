(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const chapters = [
    {title:"01 / The shop opens",heading:"A promising start",cpu:25,status:"NORMAL",state:"OK",service:"ec2",text:"Ravi launches his online shop on an EC2 instance. Customers can browse products, and the server is running comfortably.",callout:"Healthy systems are easier to keep healthy when you can see what they are doing.",log:"EC2 instance web-01 is running. CPU utilization is 25%.",level:"ok"},
    {title:"02 / The security guard",heading:"CloudWatch starts watching",cpu:50,status:"NORMAL",state:"OK",service:"cloudwatch",text:"Amazon CloudWatch collects server metrics, including CPU utilization. Think of it as a security guard checking the shop's vital signs.",callout:"A metric is a measurement over time. EC2 publishes basic CPU metrics to CloudWatch automatically.",log:"CloudWatch metric received: CPUUtilization = 50%.",level:"info"},
    {title:"03 / The CPU climbs",heading:"Something feels wrong",cpu:75,status:"WARNING",state:"OK",service:"cloudwatch",text:"More shoppers arrive, and CPU use rises to 75%. The server is under pressure, but it has not crossed Ravi's 80% alarm threshold yet.",callout:"A warning is a useful signal, but the configured alarm condition has not been met.",log:"CPU utilization rising: 75%. Alarm threshold is 80%.",level:"warn"},
    {title:"04 / Alarm triggered",heading:"The threshold is crossed",cpu:95,status:"ALARM",state:"ALARM",service:"alarm",text:"CPU reaches 95%, above the configured 80% threshold. In this simulation, the CloudWatch Alarm enters ALARM and triggers its configured action.",callout:"Real alarms use evaluation periods and datapoints-to-alarm. A single high reading does not always trigger an alarm immediately.",log:"ALARM: CPUUtilization = 95%, above threshold 80%.",level:"error"},
    {title:"05 / SNS sends the alert",heading:"The message is on its way",cpu:95,status:"ALARM",state:"ALARM",service:"sns",text:"The alarm publishes a notification to an Amazon SNS topic. SNS distributes the message to its subscribers, such as Ravi's confirmed email endpoint.",callout:"SNS is the messenger; CloudWatch Alarm decides when to send. Email subscriptions must be confirmed.",log:"SNS notification published: RaviShop-HighCPU.",level:"warn"},
    {title:"06 / Ravi takes action",heading:"The shop recovers",cpu:30,status:"RECOVERED",state:"OK",service:"email",text:"Ravi receives the alert, investigates the workload, and fixes the simulated issue. CPU drops to 30%. The alarm returns to OK once real evaluation conditions support recovery.",callout:"Recovery is not automatic just because CPU falls once. Real alarm state depends on metric data and evaluation settings.",log:"Recovery simulated: CPU is now 30%. Alarm state is OK.",level:"ok"},
    {title:"07 / See the whole system",heading:"One connected workflow",cpu:30,status:"RECOVERED",state:"OK",service:"sns",text:"The complete chain is EC2 metrics → CloudWatch Alarm → SNS topic → email. Each service has a clear role, and the alert helps a human respond.",callout:"Good monitoring connects useful measurements to an actionable response.",log:"Architecture view: EC2 → CloudWatch → Alarm → SNS → Email.",level:"info"},
    {title:"08 / Think like a DevOps engineer",heading:"Ready for production thinking",cpu:30,status:"RECOVERED",state:"OK",service:"ec2",text:"DevOps teams use monitoring and alerting to spot unhealthy services, reduce detection time, and help the right person respond before customer impact grows.",callout:"Production systems also need sensible thresholds, alert routing, dashboards, runbooks, and tested recovery procedures.",log:"Story complete. Observe. Detect. Notify. Recover.",level:"ok"}
  ];
  let current = 0, cpuHistory = [25,25,25,25,25], autoTimer = null, paused = false, mode = "beginner", toastTimer;
  const timeNow = () => new Date().toLocaleTimeString("en-GB",{hour12:false});
  function log(message, level="info") {
    const p = document.createElement("p"), time = document.createElement("time"), tag = document.createElement("span");
    time.textContent = timeNow(); tag.className = "log-" + level; tag.textContent = "[" + level.toUpperCase() + "]";
    p.append(time, document.createTextNode(" "), tag, document.createTextNode(" " + message));
    $("terminalOutput").appendChild(p); $("terminalOutput").scrollTop = $("terminalOutput").scrollHeight;
    $("terminalPrompt").textContent = message;
  }
  function toast(message) {
    const el=$("toast"); el.textContent=message; el.classList.add("show");
    clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove("show"),2600);
  }
  function drawChart() {
    const pts = cpuHistory.slice(-12), width=440, height=180;
    const coords=pts.map((v,i)=>`${pts.length===1?0:i*width/(pts.length-1)},${height-v/100*height}`);
    const last=coords[coords.length-1] || "0,135";
    $("chartLine").setAttribute("points",coords.join(" "));
    $("chartArea").setAttribute("d",`M${coords.join(" L")} L${last.split(",")[0]},180 L0,180 Z`);
    $("cpuValue").textContent=cpuHistory[cpuHistory.length-1];
  }
  function updatePipeline(ch) {
    document.querySelectorAll(".pipeline-node").forEach(n=>{
      n.classList.toggle("active",n.dataset.service===ch.service);
      n.classList.toggle("alerting",ch.state==="ALARM" && n.dataset.service==="alarm");
      n.classList.toggle("recovered",ch.status==="RECOVERED" && ["alarm","email"].includes(n.dataset.service));
    });
    $("alarmNodeStatus").textContent=ch.state;
    $("snsStatus").textContent=current>=4?"SENT":"READY";
    $("emailStatus").textContent=current>=4?"DELIVERED":"WAITING";
    $("ec2Status").textContent=ch.status==="ALARM"?"HIGH CPU":"RUNNING";
    $("pipeline").classList.toggle("is-flowing",current>=3 && current<=5);
  }
  function render(index, shouldLog=true) {
    current=Math.max(0,Math.min(chapters.length-1,index)); const ch=chapters[current];
    $("chapterTitle").textContent=ch.title; $("chapterNumber").textContent=String(current+1).padStart(2,"0");
    $("storyHeading").textContent=ch.heading; $("storyText").textContent=mode==="beginner"?ch.text:devopsText(ch);
    $("storyCallout").querySelector("p").textContent=ch.callout;
    $("progressFill").style.width=((current+1)/chapters.length*100)+"%"; $("progressText").textContent=`${current+1} of ${chapters.length} chapters`;
    $("progressFill").parentElement.setAttribute("aria-label",`${current+1} of ${chapters.length} chapters completed`);
    $("healthStatus").textContent=ch.status; $("healthStatus").className="status-pill "+(ch.status==="ALARM"?"status-alarm":ch.status==="WARNING"?"status-warning":ch.status==="RECOVERED"?"status-recovered":"status-normal");
    $("cpuCaption").textContent=ch.status==="ALARM"?"● Critical load":ch.status==="WARNING"?"● Load rising":ch.status==="RECOVERED"?"● Issue resolved":"● Healthy load";
    $("cpuCaption").style.color=ch.status==="ALARM"?"var(--red)":ch.status==="WARNING"?"var(--orange)":"var(--green)";
    $("alarmStateText").textContent=ch.state;
    cpuHistory.push(ch.cpu); if(cpuHistory.length>12)cpuHistory.shift(); drawChart(); updatePipeline(ch);
    $("nextStoryBtn").innerHTML=current===chapters.length-1?'↻ Replay story <span>': 'Next chapter <span>→</span>';
    if(shouldLog) log(ch.log,ch.level);
  }
  function devopsText(ch){return `${ch.text} Telemetry: AWS/EC2 · CPUUtilization · Average statistic · configured threshold 80%. Simulated alarm state: ${ch.state}.`;}
  function stopAuto(){if(autoTimer){clearInterval(autoTimer);autoTimer=null;} $("autoBtn").innerHTML="▶ Auto play";}
  function next(){if(current===chapters.length-1){stopAuto();render(0);return;}render(current+1);}
  function setCpu(value, message) {
    const status=value>80?"ALARM":value>=70?"WARNING":value<=35?"RECOVERED":"NORMAL";
    const state=value>80?"ALARM":"OK";
    const ch={...chapters[current],cpu:value,status,state,service:value>80?"alarm":value<=35?"email":"cloudwatch",log:message,level:value>80?"error":value>=70?"warn":"ok",title:chapters[current].title,heading:value>80?"High CPU detected":value<=35?"CPU back under control":"CPU reading updated",text:value>80?"CPU has crossed the simulated 80% threshold. The CloudWatch Alarm enters ALARM and its SNS action is simulated.":value<=35?"CPU is back to 30%. The simulation shows recovery; real alarms need sufficient new metric datapoints to return to OK.":"CPU has changed. The alarm remains OK until the configured threshold and evaluation rules are met.",callout:value>80?"In a real AWS setup, check the alarm's evaluation periods and notification action.":value<=35?"A recovery notification can be configured with the alarm's OK actions.":"Watch the metric trend and threshold."};
    chapters[current]={...chapters[current],cpu:value,status,state,service:ch.service}; $("storyHeading").textContent=ch.heading;$("storyText").textContent=mode==="beginner"?ch.text:devopsText(ch);$("storyCallout").querySelector("p").textContent=ch.callout;
    $("healthStatus").textContent=status;$("healthStatus").className="status-pill "+(status==="ALARM"?"status-alarm":status==="WARNING"?"status-warning":status==="RECOVERED"?"status-recovered":"status-normal");
    $("cpuCaption").textContent=value>80?"● Critical load":value>=70?"● Load rising":value<=35?"● Issue resolved":"● Healthy load";$("cpuCaption").style.color=value>80?"var(--red)":value>=70?"var(--orange)":"var(--green)";
    $("alarmStateText").textContent=state;$("cpuValue").textContent=value;cpuHistory.push(value);if(cpuHistory.length>12)cpuHistory.shift();drawChart();
    updatePipeline({...ch,cpu:value,status,state,service:ch.service});log(message,ch.level);toast(value>80?"Alarm triggered — SNS alert simulated.":value<=35?"Recovery simulated.":"CPU reading updated.");
  }
  $("startBtn").addEventListener("click",()=>{render(0);toast("Ravi's story started.");$("architecture").scrollIntoView({behavior:"smooth",block:"start"});});
  $("architectureBtn").addEventListener("click",()=>{$("architecture").scrollIntoView({behavior:"smooth",block:"start"});toast("Full architecture is shown in the monitoring pipeline.");});
  $("prevBtn").addEventListener("click",()=>{stopAuto();render(current-1);});
  $("nextBtn").addEventListener("click",()=>{stopAuto();next();});
  $("nextStoryBtn").addEventListener("click",()=>{stopAuto();next();});
  $("resetBtn").addEventListener("click",()=>{stopAuto();cpuHistory=[25,25,25,25,25];render(0);log("Simulation reset to initial conditions.","info");toast("Simulation reset.");});
  $("pauseBtn").addEventListener("click",()=>{if(autoTimer){stopAuto();paused=true;$("pauseBtn").textContent="Ⅱ Paused";toast("Auto play paused.");}else{paused=false;$("pauseBtn").textContent="Ⅱ Pause";toast("No auto-play sequence is currently running.");}});
  $("autoBtn").addEventListener("click",()=>{if(autoTimer){stopAuto();return;}if(current===chapters.length-1)render(0);$("autoBtn").innerHTML="Ⅱ Pause auto";autoTimer=setInterval(()=>{if(current>=chapters.length-1){stopAuto();toast("Story complete.");return;}render(current+1);},2600);});
  $("highCpuBtn").addEventListener("click",()=>{stopAuto();setCpu(95,"Manual test: CPU utilization forced to 95%. Alarm and SNS flow simulated.");});
  $("resolveBtn").addEventListener("click",()=>{stopAuto();setCpu(30,"Manual recovery: CPU utilization reduced to 30%. Alarm recovery simulated.");});
  $("snsTestBtn").addEventListener("click",()=>{log("Test SNS notification created for Ravi's inbox (simulation only).","warn");$("snsStatus").textContent="TEST SENT";$("emailStatus").textContent="SIMULATED";$("pipeline").classList.add("is-flowing");toast("SNS test notification simulated — no email was sent.");});
  $("beginnerMode").addEventListener("click",()=>{mode="beginner";$("beginnerMode").classList.add("selected");$("devopsMode").classList.remove("selected");$("modeHint").textContent="Simple language · real-life analogies";$("storyText").textContent=chapters[current].text;});
  $("devopsMode").addEventListener("click",()=>{mode="devops";$("devopsMode").classList.add("selected");$("beginnerMode").classList.remove("selected");$("modeHint").textContent="Metric namespace · thresholds · alarm state";$("storyText").textContent=devopsText(chapters[current]);});
  $("commandsToggle").addEventListener("click",()=>{const list=$("commandList");list.hidden=!list.hidden;$("commandsToggle").innerHTML=list.hidden?'Show commands <span>＋</span>':'Hide commands <span>−</span>';if(!list.hidden)list.scrollIntoView({behavior:"smooth",block:"nearest"});});
  document.querySelectorAll(".copy-btn").forEach(btn=>btn.addEventListener("click",async()=>{const value=btn.dataset.copy;try{await navigator.clipboard.writeText(value);btn.textContent="Copied!";toast("Command copied to clipboard.");setTimeout(()=>btn.textContent="Copy",1400);}catch{const area=document.createElement("textarea");area.value=value;document.body.appendChild(area);area.select();try{document.execCommand("copy");btn.textContent="Copied!";}catch{toast("Clipboard unavailable. Select and copy the command manually.");}area.remove();}}));
  $("clearLogBtn").addEventListener("click",()=>{$("terminalOutput").replaceChildren();log("Terminal cleared.","info");});
  document.addEventListener("keydown",e=>{if(e.target.matches("input,textarea,button"))return;if(e.key==="ArrowRight"){stopAuto();next();}if(e.key==="ArrowLeft"){stopAuto();render(current-1);}});
  render(0,false);
})();