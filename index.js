#!/usr/bin/env node

import { searchPoints, planJourney, selectBestPoint } from './skanetrafiken.js';

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

function formatTime(timeString) {
  if (!timeString) return '';
  const date = new Date(timeString);
  return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
}

function displayJourneys(journeys, fromName, toName) {
  if (!journeys || journeys.length === 0) {
    console.log('\nNo journeys found.');
    return;
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`Journey from "${fromName}" to "${toName}"`);
  console.log(`${'='.repeat(80)}\n`);

  journeys.forEach((journey, index) => {
    const firstLink = journey.routeLinks?.[0];
    const lastLink = journey.routeLinks?.[journey.routeLinks.length - 1];

    const departureTime = firstLink?.from?.time;
    const arrivalTime = lastLink?.to?.time;

    let duration = '';
    if (departureTime && arrivalTime) {
      const durationMs = new Date(arrivalTime) - new Date(departureTime);
      const durationMinutes = Math.round(durationMs / 60000);
      duration = formatDuration(durationMinutes);
    }

    console.log(`Trip ${index + 1}:`);
    console.log(`  Departure: ${formatTime(departureTime)}`);
    console.log(`  Arrival:   ${formatTime(arrivalTime)}`);
    console.log(`  Duration:  ${duration}`);
    console.log(`  Changes:   ${journey.noOfChanges}`);

    if (journey.routeLinks && journey.routeLinks.length > 0) {
      console.log(`  Route:`);
      journey.routeLinks.forEach((link, idx) => {
        if (link.line?.type === 'Walk') {
          const distance = link.line?.distance || '';
          console.log(`    ${idx + 1}. Walk ${distance} (${formatDuration(Math.round((new Date(link.to.time) - new Date(link.from.time)) / 60000))})`);
        } else {
          const lineInfo = link.line?.name || 'Transit';
          const lineNo = link.line?.no ? ` ${link.line.no}` : '';
          const towards = link.line?.towards ? ` ${link.line.towards}` : '';
          console.log(`    ${idx + 1}. ${lineInfo}${lineNo}${towards}`);
          console.log(`       ${formatTime(link.from.time)} ${link.from.name} → ${formatTime(link.to.time)} ${link.to.name}`);
        }
      });
    }
    console.log();
  });
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: node index.js <from-address> <to-address> [departure-time]');
    console.log('');
    console.log('Examples:');
    console.log('  node index.js "Malmö Hyllie" "Lund C"');
    console.log('  node index.js "Hyllie" "Lund Central" "2025-12-20T14:30"');
    console.log('');
    console.log('The departure-time is optional and defaults to now.');
    process.exit(1);
  }

  const fromAddress = args[0];
  const toAddress = args[1];
  const departureTime = args[2] ? new Date(args[2]) : new Date();

  try {
    console.log(`Searching for "${fromAddress}"...`);
    const fromPoints = await searchPoints(fromAddress);

    if (fromPoints.length === 0) {
      console.error(`Error: No locations found for "${fromAddress}"`);
      process.exit(1);
    }

    const fromPoint = selectBestPoint(fromPoints);
    console.log(`✓ Found: ${fromPoint.name} (${fromPoint.type})`);

    console.log(`Searching for "${toAddress}"...`);
    const toPoints = await searchPoints(toAddress);

    if (toPoints.length === 0) {
      console.error(`Error: No locations found for "${toAddress}"`);
      process.exit(1);
    }

    const toPoint = selectBestPoint(toPoints);
    console.log(`✓ Found: ${toPoint.name} (${toPoint.type})`);

    console.log('\nPlanning journey...');
    const result = await planJourney({
      fromPointId: fromPoint.id2,
      fromPointType: fromPoint.type,
      toPointId: toPoint.id2,
      toPointType: toPoint.type,
      departureTime
    });

    if (result && result.journeys) {
      displayJourneys(result.journeys, fromPoint.name, toPoint.name);
    } else {
      console.log('No journey information available.');
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
