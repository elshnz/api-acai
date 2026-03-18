import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Municipality } from './municipality/entities/municipality.entity';
import { Repository } from 'typeorm';

const municipalitiesJalisco = [
  'Acatic', 'Acatlán de Juárez', 'Ahualulco de Mercado', 'Amacueca', 'Amatitán', 'Ameca', 'San Juanito de Escobedo',
  'Arandas', 'El Arenal', 'Atemajac de Brizuela', 'Atengo', 'Atenguillo', 'Atotonilco el Alto', 'Atoyac',
  'Autlán de Navarro', 'Ayotlán', 'Ayutla', 'La Barca', 'Bolaños', 'Cabo Corrientes', 'Casimiro Castillo',
  'Cihuatlán', 'Zapotlán el Grande', 'Cocula', 'Colotlán', 'Concepción de Buenos Aires', 'Cuautitlán de García Barragán',
  'Cuautla', 'Cuquío', 'Chapala', 'Chimaltitán', 'Chiquilistlán', 'Degollado', 'Ejutla', 'Encarnación de Díaz',
  'Etzatlán', 'El Grullo', 'Guachinango', 'Guadalajara', 'Hostotipaquillo', 'Huejúcar', 'Huejuquilla el Alto',
  'La Huerta', 'Ixtlahuacán de los Membrillos', 'Ixtlahuacán del Río', 'Jalostotitlán', 'Jamay', 'Jesús María',
  'Jilotlán de los Dolores', 'Jocotepec', 'Juanacatlán', 'Juchitlán', 'Lagos de Moreno', 'El Limón', 'Magdalena',
  'Santa María del Oro', 'La Manzanilla de la Paz', 'Mascota', 'Mazamitla', 'Mexticacán', 'Mezquitic', 'Mixtlán',
  'Ocotlán', 'Ojuelos de Jalisco', 'Pihuamo', 'Poncitlán', 'Puerto Vallarta', 'Villa Purificación', 'Quitupan',
  'El Salto', 'San Cristóbal de la Barranca', 'San Diego de Alejandría', 'San Juan de los Lagos', 'San Julián',
  'San Marcos', 'San Martín de Bolaños', 'San Martín Hidalgo', 'San Miguel el Alto', 'Gómez Farías',
  'San Sebastián del Oeste', 'Santa María de los Ángeles', 'Sayula', 'Tala', 'Talpa de Allende', 'Tamazula de Gordiano',
  'Tapalpa', 'Tecalitlán', 'Tecolotlán', 'Techaluta de Montenegro', 'Tenamaxtlán', 'Teocaltiche',
  'Teocuitatlán de Corona', 'Tepatitlán de Morelos', 'Tequila', 'Teuchitlán', 'Tizapán el Alto', 'Tlajomulco de Zúñiga',
  'San Pedro Tlaquepaque', 'Tolimán', 'Tomatlán', 'Tonalá', 'Tonaya', 'Tonila', 'Totatiche', 'Tototlán', 'Tuxcacuesco',
  'Tuxcueca', 'Tuxpan', 'Unión de San Antonio', 'Unión de Tula', 'Valle de Guadalupe', 'Valle de Juárez',
  'San Gabriel', 'Villa Corona', 'Villa Guerrero', 'Villa Hidalgo', 'Cañadas de Obregón', 'Yahualica de González Gallo',
  'Zacoalco de Torres', 'Zapopan', 'Zapotiltic', 'Zapotitlán de Vadillo', 'Zapotlán del Rey', 'Zapotlanejo',
  'San Ignacio Cerro Gordo'
];

async function bootstrap() {
  console.log('🌱 Starting seeder...');
  
  // Creates an application context specifically for running this script.
  // It won't start an HTTP server.
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const municipalityRepository = app.get<Repository<Municipality>>(getRepositoryToken(Municipality));

  console.log('Seeding municipalities for Jalisco...');

  for (const name of municipalitiesJalisco) {
    const exists = await municipalityRepository.findOne({ where: { name } });
    
    if (!exists) {
      const municipality = municipalityRepository.create({ name });
      await municipalityRepository.save(municipality);
    }
  }

  console.log('✅ Seeding completed successfully.');
  
  await app.close();
}

bootstrap().catch(err => {
  console.error('❌ Seeder failed', err);
  process.exit(1);
});
