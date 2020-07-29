import app from './app';
import { createDBConnection } from '@DBConnections/PostgreSQLDB/PostgreSQLDBConnection';

createDBConnection();

const port = app.get('port') || 3000;

app.listen(port, () => {
  console.log(
    'App is running at http://localhost:%d in %s mode',
    port,
    app.get('env'),
  );
  console.log('Press CTRL-C to stop\n');
});
