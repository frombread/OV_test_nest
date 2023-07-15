import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Add this line to enable CORS
    app.enableCors({
        origin: ['http://localhost:3001', 'http://192.168.0.113:3001'],
        credentials: true,
    });

    await app.listen(3000);

    // Log the server start
    console.log('Server started on port 3000');
}
bootstrap();
