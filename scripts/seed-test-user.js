import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'agency'

async function seedTestUser() {
  if (!uri) {
    console.error('MONGODB_URI is not set in environment variables')
    process.exit(1)
  }

  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log('Connected to MongoDB')

    const db = client.db(dbName)
    const collection = db.collection('schema_clients')

    // Check if user already exists
    const existingUser = await collection.findOne({ contact_email: 'manus@manus.com' })
    
    if (existingUser) {
      console.log('User already exists, updating password...')
      await collection.updateOne(
        { contact_email: 'manus@manus.com' },
        { $set: { password: 'test2025' } }
      )
      console.log('Password updated successfully')
    } else {
      console.log('Creating new test user...')
      const result = await collection.insertOne({
        contact_email: 'manus@manus.com',
        password: 'test2025',
        contact_name: 'Manus Test User',
        client_name: 'Manus Test Client',
        domain: 'https://www.climberbi.co.uk',
        created_at: new Date(),
        updated_at: new Date()
      })
      console.log('Test user created successfully:', result.insertedId)
    }

    console.log('\nTest user credentials:')
    console.log('Email: manus@manus.com')
    console.log('Password: test2025')

  } catch (error) {
    console.error('Error seeding test user:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('\nDatabase connection closed')
  }
}

seedTestUser()
