import { connectToDatabase } from '../../lib/mongodb'

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Simple security check - require a secret key
  const { secret, email, password, name } = req.body
  if (secret !== 'seed-test-user-2025') {
    return res.status(403).json({ message: 'Forbidden' })
  }

  try {
    const { db } = await connectToDatabase()
    const collection = db.collection('users')

    // Check if user already exists
    const existingUser = await collection.findOne({ email: email || 'manus@manus.com' })
    
    if (existingUser) {
      // Update existing user's password
      await collection.updateOne(
        { email: email || 'manus@manus.com' },
        { 
          $set: { 
            password: password || 'test2025',
            name: name || existingUser.name,
            last_login: new Date()
          } 
        }
      )
      return res.status(200).json({ 
        success: true, 
        message: 'User password updated',
        user: {
          email: existingUser.email,
          name: name || existingUser.name
        }
      })
    } else {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found'
      })
    }
  } catch (error) {
    console.error('Error updating user:', error)
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    })
  }
}
