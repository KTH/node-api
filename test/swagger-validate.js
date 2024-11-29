/**
 * This script validates the project's swagger.json file.
 * It exits with code 0 iff no errors could be found.
 *
 * All output is written to STDERR
 * so that it's also visible when run as Git pre-push hook.
 */

const SwaggerParser = require('swagger-parser')

process.stderr.write('\nValidating swagger.json\n')

async function mainAsync() {
  try {
    await SwaggerParser.validate('swagger.json', { continueOnError: true })
  } catch ({ errors, message, details }) {
    if (errors) {
      console.error(
        '\nERRORS:\n',
        errors.map(item => ({ message: item.message, path: JSON.stringify(item.path) })),
        '\n'
      )
    } else {
      console.error('\nERROR:\n', message, details, '\n')
    }
    process.exit(1)
  }

  process.stderr.write('OK\n')
}

mainAsync()
