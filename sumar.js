
process.on("message", (msg) => {
   
  const resultados = Aleatorios(msg)

  const duplicados = resultados.reduce((prev, cur) => ((prev[cur] = prev[cur] + 1 || 1), prev), {})

  process.send(duplicados)
})

const Aleatorios =(msg)=>{
  new Array()
  let miarray = Array.from({length: msg }, () => Math.floor(Math.random() * 1000));
  return miarray
}