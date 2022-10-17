
process.on("message", (msg) => {
   
  const resultados = Aleatorios(msg)

  process.send(resultados)
})

const Aleatorios =(msg)=>{
  new Array()
  let miarray = Array.from({length: msg || 100000000}, () => Math.floor(Math.random() * 1000));
  return miarray
} 