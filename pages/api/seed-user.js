import { connectToDatabase } from '../../lib/mongodb'

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Simple security check - require a secret key
  const { secret } = req.body
  if (secret !== 'seed-test-user-2025') {
    return res.status(403).json({ message: 'Forbidden' })
  }

  try {
    const { db } = await connectToDatabase()
    const collection = db.collection('schema_clients')

    // Check if user already exists
    const existingUser = await collection.findOne({ contact_email: 'manus@manus.com' })
    
    if (existingUser) {
      // Update existing user's password
      await collection.updateOne(
        { contact_email: 'manus@manus.com' },
        { 
          $set: { 
            password: 'test2025',
            updated_at: new Date()
          } 
        }
      )
      return res.status(200).json({ 
        success: true, 
        message: 'User already exists, password updated',
        user: {
          email: 'manus@manus.com',
          name: existingUser.contact_name
        }
      })
    } else {
      // Create new test user
      const result = await collection.insertOne({
        contact_email: 'manus@manus.com',
        password: 'test2025',
        contact_name: 'Manus Test User',
        client_name: 'Manus Test Client',
        domain: 'https://www.climberbi.co.uk',
        created_at: new Date(),
        updated_at: new Date()
      })
      
      return res.status(200).json({ 
        success: true, 
        message: 'Test user created successfully',
        userId: result.insertedId.toString(),
        credentials: {
          email: 'manus@manus.com',
          password: 'test2025'
        }
      })
    }
  } catch (error) {
    console.error('Error seeding test user:', error)
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    })
  }
}
