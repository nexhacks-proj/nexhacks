#!/usr/bin/env tsx
/**
 * Diagnostic script to test MongoDB connection with detailed error info
 */

import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://elgooseman321_db_user:VkOrkGwTYnu64tuz@maincluster.ndr3cps.mongodb.net/swipehire?retryWrites=true&w=majority&appName=MainCluster'

async function testConnection() {
  console.log('🔍 MongoDB Connection Diagnostics\n')
  console.log(`Connection String: ${MONGODB_URI.replace(/:[^:@]+@/, ':***@')}\n`)

  // Test 1: Basic connection
  console.log('Test 1: Basic Connection')
  console.log('─────────────────────────────────')
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    console.log('✅ Connected successfully!')
    console.log(`   Database: ${conn.connection.db?.databaseName}`)
    console.log(`   Host: ${conn.connection.host}`)
    console.log(`   Port: ${conn.connection.port}`)
    await mongoose.disconnect()
    return true
  } catch (error: any) {
    console.log('❌ Connection failed\n')
    console.log('Error details:')
    console.log(`   Message: ${error.message}`)
    
    if (error.name === 'MongooseServerSelectionError') {
      console.log('\n🔒 Possible Issues:')
      console.log('   1. IP not whitelisted (wait 2-3 min after adding)')
      console.log('   2. Network firewall blocking MongoDB ports (27017, 443)')
      console.log('   3. School/corporate WiFi blocking database connections')
      console.log('   4. VPN interfering with connection')
      console.log('   5. Incorrect username/password')
    }
    
    if (error.cause?.reason) {
      const reason = error.cause.reason
      console.log(`\n   Server Status: ${reason.type}`)
      if (reason.servers) {
        console.log(`   Servers attempted: ${reason.servers.size}`)
      }
    }
    
    // Check if it's a network/firewall issue
    const errorMsg = error.message.toLowerCase()
    if (errorMsg.includes('timeout') || errorMsg.includes('enotfound') || errorMsg.includes('econnrefused')) {
      console.log('\n🚫 NETWORK/FIREWALL ISSUE DETECTED')
      console.log('   This looks like a network blocking issue.')
      console.log('   Solutions:')
      console.log('   • Try a different network (mobile hotspot, home WiFi)')
      console.log('   • Disable VPN if active')
      console.log('   • Contact network admin about MongoDB Atlas (ports 443/27017)')
      console.log('   • Use MongoDB Realm Functions as proxy (advanced)')
    }
    
    return false
  }
}

// Test 2: Check if we can reach the domain
async function testDNS() {
  console.log('\n\nTest 2: DNS Resolution')
  console.log('─────────────────────────────────')
  const dns = await import('dns').then(m => m.promises)
  
  try {
    const hostname = 'maincluster.ndr3cps.mongodb.net'
    
    // Try A record (IPv4)
    try {
      const addresses = await dns.resolve4(hostname)
      console.log(`✅ A record resolved: ${hostname}`)
      console.log(`   IP addresses: ${addresses.join(', ')}`)
    } catch (e: any) {
      console.log(`❌ A record lookup failed: ${e.message}`)
    }
    
    // Try SRV record (used by mongodb+srv://)
    try {
      const srv = await dns.resolveSrv(`_mongodb._tcp.${hostname}`)
      console.log(`✅ SRV record resolved:`)
      srv.forEach(record => {
        console.log(`   ${record.name}:${record.port} (priority: ${record.priority})`)
      })
      return true
    } catch (e: any) {
      console.log(`❌ SRV record lookup failed: ${e.message}`)
      console.log(`   ⚠️  This is critical - mongodb+srv:// requires SRV records!`)
    }
    
    return false
  } catch (error: any) {
    console.log(`❌ DNS lookup failed: ${error.message}`)
    return false
  }
}

// Test 3: Try with different connection options
async function testConnectionOptions() {
  console.log('\n\nTest 3: Alternative Connection Options')
  console.log('─────────────────────────────────')
  
  const testOptions = [
    { name: 'Standard', opts: {} },
    { name: 'Short timeout', opts: { serverSelectionTimeoutMS: 3000 } },
    { name: 'Long timeout', opts: { serverSelectionTimeoutMS: 15000 } },
  ]
  
  for (const test of testOptions) {
    try {
      console.log(`Trying: ${test.name}...`)
      await mongoose.connect(MONGODB_URI, {
        ...test.opts,
        bufferCommands: false,
      })
      console.log(`✅ ${test.name} succeeded!`)
      await mongoose.disconnect()
      return true
    } catch (error: any) {
      console.log(`❌ ${test.name} failed: ${error.message.substring(0, 60)}...`)
    }
  }
  
  return false
}

async function runDiagnostics() {
  const dnsOk = await testDNS()
  const basicOk = await testConnection()
  
  if (!basicOk && dnsOk) {
    console.log('\n\n💡 Since DNS works but connection fails, this is likely:')
    console.log('   • Network firewall blocking MongoDB')
    console.log('   • School/corporate WiFi restrictions')
    console.log('   • Try mobile hotspot to confirm')
  }
  
  if (!dnsOk) {
    console.log('\n\n💡 DNS resolution failed - check internet connection')
  }
  
  if (basicOk) {
    console.log('\n\n🎉 Connection works! Your setup is correct.')
  } else {
    console.log('\n\n📋 Quick Fixes to Try:')
    console.log('   1. Switch to mobile hotspot')
    console.log('   2. Disable VPN')
    console.log('   3. Try from home network')
    console.log('   4. Verify IP whitelist includes your current IP')
    console.log('   5. Double-check username/password in connection string')
  }
}

runDiagnostics().catch(console.error)
