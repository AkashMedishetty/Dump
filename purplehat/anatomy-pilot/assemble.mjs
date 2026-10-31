// encode every clip, then crossfade them in order and lay the score under it
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
const plan = JSON.parse(readFileSync("plan.json", "utf8"));
const ff = (args) => execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...args], { stdio: "inherit" });
for (const fmt of ["9x16", "16x9"]) {
  const [W, H] = fmt === "9x16" ? [1080, 1920] : [1920, 1080];
  const files = [];
  for (const c of plan.clips) {
    const out = `clip-${c.name}-${fmt}.mp4`;
    if (c.name === "sting") {
      const vf = fmt === "16x9" ? `fps=30,format=yuv420p` : `fps=30,split[a][b];[a]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},boxblur=40:2,eq=brightness=-0.08[bg];[b]scale=${W}:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,format=yuv420p`;
      ff(["-ss", String(plan.stingFrom), "-i", "../PurpleHat-3D-sting-v2.mp4", "-t", String(c.len), "-an", "-filter_complex", vf, "-c:v", "libx264", "-crf", "15", "-preset", "medium", out]);
    } else {
      ff(["-framerate", "30", "-i", `sq/${c.name}-${fmt}/%04d.png`, "-frames:v", String(Math.round(c.len * 30)), "-vf", "format=yuv420p", "-c:v", "libx264", "-crf", "15", "-preset", "medium", out]);
    }
    files.push(out);
  }
  // xfade chain
  const inputs = files.flatMap((f) => ["-i", f]);
  let chain = "", last = "[0:v]";
  for (let i = 1; i < files.length; i++) {
    const lab = i === files.length - 1 ? "[v]" : `[x${i}]`;
    chain += `${last}[${i}:v]xfade=transition=fade:duration=${plan.x}:offset=${plan.clips[i].off.toFixed(3)}${lab};`;
    last = lab;
  }
  ff([...inputs, "-i", "reel-mix.wav", "-filter_complex", chain.slice(0, -1), "-map", "[v]", "-map", `${files.length}:a`, "-c:v", "libx264", "-crf", "18", "-preset", "slow", "-maxrate", "9M", "-bufsize", "18M", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "224k", "-movflags", "+faststart", "-shortest", `../PurpleHat-Anatomy-Showreel-${fmt}.mp4`]);
  console.log("wrote", fmt);
}
