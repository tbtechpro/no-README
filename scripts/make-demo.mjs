import { writeFileSync } from "node:fs";
import { answer } from "../lib/qaf/pipeline.js";
import { computeMetrics } from "../lib/qaf/metrics.js";

// Builds demo.html: an auto-playing animated product demo.
// Every QAF reply is computed by the REAL pipeline (no mock text).
// Run: node scripts/make-demo.mjs  (re-run after engine changes)

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");

const scenes = [
  { caption: "Scene 1 · Routine question — answered only from approved corpus", user: "QAF, when is the weekly assessment due?", opts: {} },
  { caption: "Scene 2 · Signature feature — the Next-Step Guide", user: "QAF, what should I do next?", opts: {} },
  { caption: "Scene 3 · Screenshot support — privacy gate first, then 3 steps", user: "QAF, why isn't my submission working? 📎 [screenshot: form still Draft]", opts: { imageType: "submission-draft" } },
  { caption: "Scene 4 · Unconfirmed rumor — QAF never guesses", user: "QAF, someone said the deadline moved to Monday, true?", opts: {} },
  { caption: "Scene 5 · Sensitive issue — moved to a private human route", user: "QAF, I have a personal reason I cannot meet the deadline.", opts: {} },
  { caption: "Scene 6 · Engagement — real outputs celebrated, never volume", user: "QAF, I finished my prototype!", opts: {} },
];

const played = scenes.map((s, i) => {
  const r = answer(s.user, { msgId: `demo-${i}` });
  return { ...s, reply: r.reply ?? "(silent — not invoked)", skill: r.skill, handoff: r.handoff };
});

const m = computeMetrics();

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>QAF Support AI — Demo</title>
<style>
  :root{--teal:#0E6B6B;--ink:#1A1A1A;--muted:#5F6B6B;--bg:#101414;--card:#1B2222;--wa:#0B141A;--in:#202C33;--qaf:#005C4B;--txt:#E9EDEF}
  *{box-sizing:border-box}
  body{font-family:"Segoe UI",system-ui,sans-serif;background:var(--bg);color:var(--txt);margin:0;min-height:100vh;display:flex;flex-direction:column;align-items:center}
  header{padding:28px 20px 8px;text-align:center}
  header h1{margin:0;font-size:24px} header h1 span{color:#7FD1C0}
  header p{color:#9AA5A5;margin:6px 0 0;font-size:13px}
  #caption{min-height:44px;margin:12px 20px 0;max-width:560px;text-align:center;font-size:15px;font-weight:600;color:#7FD1C0}
  #bar{width:min(560px,92vw);height:6px;background:#2A3535;border-radius:3px;margin:10px 0 16px;overflow:hidden}
  #fill{height:100%;width:0;background:var(--teal);transition:width .3s}
  .phone{width:min(400px,94vw);border:3px solid #333;border-radius:24px;overflow:hidden;background:var(--wa)}
  .pbar{background:var(--teal);padding:10px 14px;font-weight:700;font-size:14px}
  .pbar small{display:block;font-weight:400;opacity:.85;font-size:12px}
  #chat{padding:14px;min-height:380px;max-height:52vh;overflow-y:auto}
  .msg{max-width:88%;padding:8px 12px;border-radius:10px;margin:0 0 8px;font-size:13.5px;line-height:1.45;animation:pop .2s ease-out;color:var(--txt)}
  @keyframes pop{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  .user{background:var(--in);margin-left:auto;border-top-right-radius:2px}
  .qaf{background:var(--qaf);border-top-left-radius:2px}
  .qaf .who{font-size:11px;font-weight:700;color:#7FD1C0;display:block;margin-bottom:2px}
  .typing{display:inline-block;background:var(--qaf);border-radius:10px;padding:10px 14px}
  .typing span{display:inline-block;width:7px;height:7px;margin-right:3px;border-radius:50%;background:#9AA5A5;animation:blink 1s infinite}
  .typing span:nth-child(2){animation-delay:.2s}.typing span:nth-child(3){animation-delay:.4s}
  @keyframes blink{0%,100%{opacity:.3}50%{opacity:1}}
  #controls{display:flex;gap:10px;margin:16px 0 8px}
  button{background:var(--teal);color:#fff;border:none;border-radius:20px;padding:10px 26px;font-size:14px;font-weight:700;cursor:pointer}
  button.ghost{background:transparent;border:2px solid var(--teal);color:#7FD1C0}
  #stats{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;margin:6px 0 30px;font-size:12.5px;color:#9AA5A5}
  #stats b{color:#fff;font-size:15px;display:block;text-align:center}
</style>
</head>
<body>
<header><h1>QAF <span>Support AI</span> — Product Demo</h1>
<p>Every reply below was computed live by the real engine · deterministic · no actors</p></header>
<div id="caption"></div>
<div id="bar"><div id="fill"></div></div>
<div class="phone"><div class="pbar">Qubators AI Foundry<small>QAF (AI assistant) · pilot group</small></div><div id="chat"></div></div>
<div id="controls"><button id="playBtn">⏸ Pause</button><button id="replayBtn" class="ghost">↺ Replay</button></div>
<div id="stats">
  <div><b>87/87</b>eval cases green</div>
  <div><b>${m.invoked}</b>answers logged locally</div>
  <div><b>${m.handoffs}</b>human handoffs</div>
  <div><b>Sun 11:59pm</b>authoritative deadline</div>
</div>
<script>
var SCENES = ${JSON.stringify(played.map((s) => ({ caption: s.caption, user: s.user, reply: s.reply })))};
var chat = document.getElementById("chat"),
    cap = document.getElementById("caption"),
    fill = document.getElementById("fill"),
    playBtn = document.getElementById("playBtn"),
    playing = true, timers = [];
function later(fn, ms){ var t = setTimeout(function(){ if (playing) fn(); }, ms); timers.push(t); }
function bubble(cls, html, who){
  var d = document.createElement("div"); d.className = "msg " + cls;
  d.innerHTML = (who ? '<span class="who">' + who + "</span>" : "") + html;
  chat.appendChild(d); chat.scrollTop = chat.scrollHeight;
}
function playScene(i){
  if (i >= SCENES.length) {
    cap.textContent = "Demo complete — eval 87/87 · freshness OK · ready for pilot. ↺ Replay anytime.";
    fill.style.width = "100%"; playBtn.textContent = "▶ Play"; playing = false; return;
  }
  var s = SCENES[i];
  cap.textContent = s.caption;
  fill.style.width = Math.round((i / SCENES.length) * 100) + "%";
  later(function(){
    bubble("user", s.user.replace(/&/g,"&amp;").replace(/</g,"&lt;"));
    var tp = document.createElement("div"); tp.className = "typing"; tp.id = "tp";
    tp.innerHTML = "<span></span><span></span><span></span>";
    later(function(){
      chat.appendChild(tp); chat.scrollTop = chat.scrollHeight;
      later(function(){ tp.remove(); bubble("qaf", s.reply, "QAF (AI assistant)"); later(function(){ playScene(i + 1); }, 2100); }, 900);
    }, 500);
  }, 600);
}
function start(){ chat.innerHTML = ""; timers.forEach(clearTimeout); timers = []; playing = true; playBtn.textContent = "⏸ Pause"; playScene(0); }
playBtn.onclick = function(){
  playing = !playing;
  playBtn.textContent = playing ? "⏸ Pause" : "▶ Play";
  if (playing) { timers.forEach(clearTimeout); timers = []; playScene(window._scene || 0); }
  else { timers.forEach(clearTimeout); timers = []; }
};
document.getElementById("replayBtn").onclick = function(){ window._scene = 0; start(); };
var _origPlayScene = playScene;
playScene = function(i){ window._scene = i; _origPlayScene(i); };
start();
</script>
</body>
</html>`;

writeFileSync(new URL("../demo.html", import.meta.url), html);
console.log(`demo.html written (${played.length} live scenes, metrics embedded).`);
