export function secondToHHMMSS(s: number) {
  let h = Math.floor(s / 3600);
  let m = Math.floor((s - (h * 3600)) / 60);
  s = s - (h * 3600) - (m * 60);

  let HH = h.toString(), MM = m.toString(), SS = s.toString();

  if (h < 10) {HH = '0' + HH;}
  if (m < 10) {MM = '0' + MM;}
  if (s < 10) {SS = '0' + SS;}

  return `${HH}:${MM}:${SS}`
}