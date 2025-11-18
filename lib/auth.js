import { connectToDatabase } from './mongodb'

export async function authenticateUser(email, password) {
  try {
    const { db } = await connectToDatabase()
    
    const user = await db.collection('users').findOne({
      email: email
    })

    if (!user) {
      return { success: false, message: 'Invalid credentials' }
    }

    // Simple plain text password comparison
    if (user.password !== password) {
      return { success: false, message: 'Invalid credentials' }
    }

    return {
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        clientId: user.clientId,
        accountId: user['Account ID']
      }
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return { success: false, message: 'Authentication failed' }
  }
}

