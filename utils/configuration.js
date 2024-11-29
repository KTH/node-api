// return development defaults only if in development mode. Prevents accidentally carrying dev defaults to referens
const devDefaults = (def) => {
  const env = Deno.env.get("NODE_ENV")
  if (env === 'development' || env === 'dev') return def
  return ''
}

module.exports = {
  devDefaults
}