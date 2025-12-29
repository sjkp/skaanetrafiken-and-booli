#!/usr/bin/env node

import { BooliClient, buildSearchInput } from './booli-api.js';
import { searchPoints, planJourney, selectBestPoint, calculateJourneyTime } from './skanetrafiken.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Debug mode flag - can be set via environment variable or command line argument
const DEBUG_MODE = process.env.DEBUG === 'true' || process.argv.includes('--debug');

/**
 * Fetch image and prepare for email attachment (CID approach)
 */
async function fetchImageForEmail(imageUrl, propertyId) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = response.headers.get('content-type') || 'image/jpeg';
    const extension = mimeType.includes('png') ? 'png' : 'jpg';

    return {
      buffer,
      mimeType,
      cid: `property-${propertyId}`,
      filename: `property-${propertyId}.${extension}`,
      originalUrl: imageUrl
    };
  } catch (error) {
    console.error(`Error fetching image ${imageUrl}:`, error.message);
    return null;
  }
}

/**
 * Fetch image and convert to base64 (for debug HTML files only)
 */
async function fetchImageAsBase64(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const mimeType = response.headers.get('content-type') || 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error(`Error fetching image ${imageUrl}:`, error.message);
    return null;
  }
}

/**
 * Generate HTML email content
 */
function generateEmailHTML(properties, useInlineImages = false) {
  const propertyCards = properties.map((property, index) => {
    let imageHtml;

    if (useInlineImages && property.imageBase64) {
      // Use base64 images for debug/preview mode
      imageHtml = `<img src="${property.imageBase64}" alt="Property image" class="property-image">`;
    } else if (property.imageCid) {
      // Use CID reference for email attachments
      imageHtml = `<img src="cid:${property.imageCid}" alt="Property image" class="property-image">`;
    } else if (property.imageUrl) {
      // Fallback to direct URL (may not work in many email clients)
      imageHtml = `<img src="${property.imageUrl}" alt="Property image" class="property-image">`;
    } else {
      // No image placeholder
      imageHtml = `<div class="property-image property-image-placeholder">No Image</div>`;
    }

    return `
    <div class="property-card">
      <div class="property-content">
        <div class="property-image-container">
          ${imageHtml}
        </div>
        <div class="property-details">
          <h2 class="property-title">
            <a href="${property.url}" class="property-link">${property.address}</a>
          </h2>
          <p class="property-info"><strong>Type:</strong> ${property.type}</p>
          <p class="property-info"><strong>Location:</strong> ${property.location}</p>
          <p class="property-info"><strong>Price:</strong> ${property.price}</p>
          <p class="property-info"><strong>Travel time from Hyllie:</strong> ${property.travelTime}</p>
          <div class="property-button-container">
            <a href="${property.url}" class="property-button">View Property</a>
          </div>
        </div>
      </div>
    </div>
  `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Properties in Skåne</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          margin: 0; 
          padding: 20px; 
          background-color: #f4f4f4; 
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
        .container { 
          max-width: 800px; 
          margin: 0 auto; 
          background-color: white; 
          padding: 20px; 
          border-radius: 10px; 
        }
        .header { 
          text-align: center; 
          color: #2c5530; 
          border-bottom: 2px solid #2c5530; 
          padding-bottom: 20px; 
          margin-bottom: 30px; 
        }
        .summary { 
          background-color: #e8f5e8; 
          padding: 15px; 
          border-radius: 8px; 
          margin-bottom: 20px; 
        }
        
        /* Property card styles */
        .property-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          font-family: Arial, sans-serif;
          background-color: #f9f9f9;
        }
        
        .property-content {
          display: table;
          width: 100%;
        }
        
        .property-image-container {
          display: table-cell;
          vertical-align: top;
          width: 200px;
          padding-right: 20px;
        }
        
        .property-image {
          width: 200px;
          height: 150px;
          object-fit: cover;
          border-radius: 8px;
          display: block;
        }
        
        .property-image-placeholder {
          background-color: #e0e0e0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
        }
        
        .property-details {
          display: table-cell;
          vertical-align: top;
          width: auto;
        }
        
        .property-title {
          color: #2c5530;
          margin: 0 0 10px 0;
          font-size: 18px;
        }
        
        .property-link {
          color: #2c5530;
          text-decoration: none;
        }
        
        .property-info {
          margin: 5px 0;
          color: #666;
        }
        
        .property-button-container {
          margin-top: 10px;
        }
        
        .property-button {
          background-color: #2c5530;
          color: white;
          padding: 8px 16px;
          text-decoration: none;
          border-radius: 4px;
          font-size: 14px;
          display: inline-block;
        }
        
        /* Mobile responsiveness - Gmail and other email clients */
        @media only screen and (max-width: 600px) {
          body {
            padding: 10px !important;
          }
          
          .container {
            padding: 15px !important;
          }
          
          .property-card {
            padding: 15px !important;
            margin: 15px 0 !important;
          }
          
          .property-content {
            display: block !important;
          }
          
          .property-image-container {
            display: block !important;
            width: 100% !important;
            padding-right: 0 !important;
            margin-bottom: 15px !important;
            text-align: center;
          }
          
          .property-image {
            width: 100% !important;
            max-width: 300px !important;
            height: auto !important;
            aspect-ratio: 4/3;
          }
          
          .property-details {
            display: block !important;
            width: 100% !important;
          }
          
          .property-title {
            font-size: 16px !important;
          }
          
          .header h1 {
            font-size: 24px !important;
          }
        }
        
        /* Additional Gmail-specific fixes */
        .gmail-fix {
          min-width: 100% !important;
        }
        
        /* Outlook-specific fixes */
        .outlook-fix {
          mso-table-lspace: 0pt !important;
          mso-table-rspace: 0pt !important;
        }
        
        /* Force Outlook to provide a "view in browser" menu link */
        #outlook a {
          padding: 0;
        }
        
        /* Force Hotmail to display emails at full width */
        .ExternalClass {
          width: 100%;
        }
        
        .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
          line-height: 100%;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏠 New Properties in Skåne</h1>
          <p>Villa, Fritidshus & Gård within 2000m of water</p>
        </div>
        
        <div class="summary">
          <h3>Search Summary</h3>
          <ul>
            <li><strong>Property types:</strong> Villa, Fritidshus, Gård</li>
            <li><strong>Location:</strong> Skåne län</li>
            <li><strong>Max distance to water:</strong> 2000m</li>
            <li><strong>Listed within:</strong> Last 3 days</li>
            <li><strong>Properties found:</strong> ${properties.length}</li>
          </ul>
        </div>

        ${propertyCards}

        <div style="text-align: center; margin-top: 40px; padding: 20px; background-color: #f0f0f0; border-radius: 8px;">
          <p style="color: #666; margin: 0;">Generated on ${new Date().toLocaleDateString('sv-SE')} at ${new Date().toLocaleTimeString('sv-SE')}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send email with property listings and attached images
 */
async function sendEmail(htmlContent, imageAttachments = []) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const attachments = imageAttachments.map(img => ({
    filename: img.filename,
    content: img.buffer,
    contentType: img.mimeType,
    cid: img.cid,
    contentDisposition: 'inline'
  }));

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    subject: process.env.EMAIL_SUBJECT || 'New Properties in Skåne',
    html: htmlContent,
    attachments: attachments
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    console.log(`Sent with ${attachments.length} image attachments`);
  } catch (error) {
    console.error('Error sending email:', error.message);
  }
}

/**
 * Save HTML content to file for debugging
 */
function saveHTMLToFile(htmlContent) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `property-email-${timestamp}.html`;
  const filepath = path.join(process.cwd(), filename);

  try {
    fs.writeFileSync(filepath, htmlContent, 'utf8');
    console.log(`HTML content saved to: ${filepath}`);
    console.log('You can open this file in a web browser to preview the email.');
  } catch (error) {
    console.error('Error saving HTML file:', error.message);
  }
}

async function findPropertiesInSkane() {
  const client = new BooliClient();

  if (DEBUG_MODE) {
    console.log('🐛 DEBUG MODE ENABLED - HTML will be saved to file instead of sent via email\n');
  }

  try {
    // Find Skåne area ID
    const skaneAreaId = await client.findAreaId('Skåne län', { type: 'Län' });

    if (!skaneAreaId) {
      console.error('Could not find Skåne area ID');
      return;
    }

    console.log(`Found Skåne area ID: ${skaneAreaId}`);


    // Build search parameters
    const searchInput = buildSearchInput({
      areaId: skaneAreaId,
      objectType: 'Villa,Fritidshus,Gård',
      maxDistanceToWater: '2000', // 2000 meters
      daysActive: 3, // Listed within last 3 days
      page: 1,
      excludeAncestors: true
    });

    console.log('Searching for properties with criteria:');
    console.log('- Location: Skåne län');
    console.log('- Property types: Villa, Fritidshus, Gård');
    console.log('- Max distance to water: 2000m');
    console.log('- Listed within last 3 days');
    console.log('');

    // Search for properties
    const searchResults = await client.search(searchInput, {
      queryContext: 'SERP_LIST_LISTING',
      limit: 100
    });

    console.log(`Total results: ${searchResults.forSale.totalCount}`);
    console.log(`Pages: ${searchResults.forSale.pages}`);
    console.log(`\nFirst ${searchResults.forSale.result.length} listings:\n`);

    // Collect property data for email
    console.log('Calculating travel times and preparing email data...\n');
    const properties = [];

    for (let i = 0; i < searchResults.forSale.result.length; i++) {
      const listing = searchResults.forSale.result[i];
      let travelTime = 'N/A';

      try {
        // Search for the destination
        const destination = `${listing.streetAddress}, ${listing.descriptiveAreaName}`;
        const destinationPoints = await searchPoints(destination);

        const destinationPoint = selectBestPoint(destinationPoints);

        if (destinationPoint) {
          // Plan journey from Hyllie to destination
          const hylliePoints = await searchPoints('Hyllie, Malmö');
          const hylliePoint = selectBestPoint(hylliePoints);

          if (hylliePoint) {
            const journey = await planJourney({
              fromPoint: hylliePoint,
              toPoint: destinationPoint,
              departureTime: new Date()
            });

            const timeInfo = calculateJourneyTime(journey);
            if (timeInfo) {
              travelTime = timeInfo.formatted;
            }
          }
        }
      } catch (error) {
        console.error(`Error calculating travel time for ${listing.streetAddress}:`, error.message);
      }

      // Prepare image for email (different approaches for debug vs email)
      const imageUrl = listing.primaryImage ? `https://bcdn.se/images/cache/${listing.primaryImage.id}_420x0.jpg` : null;
      const propertyId = listing.booliId || i;

      let property;

      if (DEBUG_MODE) {
        // For debug mode, use base64 for HTML file
        const imageBase64 = imageUrl ? await fetchImageAsBase64(imageUrl) : null;
        property = {
          address: listing.streetAddress,
          type: listing.objectType,
          location: `${listing.descriptiveAreaName}, ${listing.location.region.municipalityName}`,
          price: listing.listPrice?.formatted || 'N/A',
          travelTime,
          url: `https://www.booli.se${listing.url}`,
          imageBase64,
          imageUrl
        };
      } else {
        // For email mode, prepare image as attachment
        const imageData = imageUrl ? await fetchImageForEmail(imageUrl, propertyId) : null;
        property = {
          address: listing.streetAddress,
          type: listing.objectType,
          location: `${listing.descriptiveAreaName}, ${listing.location.region.municipalityName}`,
          price: listing.listPrice?.formatted || 'N/A',
          travelTime,
          url: `https://www.booli.se${listing.url}`,
          imageCid: imageData?.cid,
          imageData,
          imageUrl
        };
      }

      properties.push(property);

      // Console output
      console.log(`${i + 1}. ${listing.streetAddress}`);
      console.log(`   Type: ${listing.objectType}`);
      console.log(`   Location: ${listing.descriptiveAreaName}, ${listing.location.region.municipalityName}`);
      console.log(`   Price: ${listing.listPrice?.formatted || 'N/A'}`);
      console.log(`   Travel time from Hyllie: ${travelTime}`);
      console.log(`   URL: https://www.booli.se${listing.url}`);
      console.log('');
    }

    // Generate and send email if properties found
    if (properties.length > 0) {
      console.log('Generating email content...');

      if (DEBUG_MODE) {
        console.log('Debug mode enabled - saving HTML to file instead of sending email...');
        const emailHTML = generateEmailHTML(properties, true); // Use inline images for debug
        saveHTMLToFile(emailHTML);
      } else {
        // Prepare image attachments for email
        const imageAttachments = properties
          .map(p => p.imageData)
          .filter(img => img !== null && img !== undefined);

        const emailHTML = generateEmailHTML(properties, false); // Use CID references for email

        // Only send email if environment variables are configured
        if (process.env.SMTP_HOST && process.env.EMAIL_TO) {
          console.log(`Sending email with ${imageAttachments.length} image attachments...`);
          await sendEmail(emailHTML, imageAttachments);
        } else {
          console.log('Email not sent - SMTP configuration missing. Configure .env file with email settings.');
          console.log('You can copy .env.example to .env and fill in your email settings.');
          console.log('Alternatively, use --debug flag to save HTML to file for testing.');
        }
      }
    } else {
      console.log('No properties found - no email sent.');
    }


  } catch (error) {
    console.error('Error searching for properties:', error.message);
  }
}

// Run the script
findPropertiesInSkane();