import { connectToDatabase } from './mongodb'

export async function authenticateUser(email, password) {
  try {
    const { db } = await connectToDatabase()
    
    const client = await db.collection('schema_clients').findOne({
      contact_email: email
    })

    if (!client) {
      return { success: false, message: 'Invalid credentials' }
    }

    // Simple plain text password comparison
    if (client.password !== password) {
      return { success: false, message: 'Invalid credentials' }
    }

    return {
      success: true,
      user: {
        id: client._id.toString(),
        email: client.contact_email,
        name: client.contact_name,
        clientId: client._id.toString(),
        clientName: client.client_name,
        domain: client.domain
      }
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return { success: false, message: 'Authentication failed' }
  }
}

