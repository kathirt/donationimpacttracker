#!/usr/bin/env node

/**
 * NCCS Data Fetcher - Test Version
 * Small test to validate the NCCS data fetcher before full download
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

class NCCSTestFetcher {
  private outputDir: string;

  constructor() {
    this.outputDir = path.join(__dirname, '..', 'data', 'nccs-test');
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Test download of one small file to verify connectivity
   */
  private async testDownload(): Promise<void> {
    const testUrl = 'https://nccs-efile.s3.us-east-1.amazonaws.com/public/v2025/F9-P00-T00-HEADER-2023.csv';
    const outputPath = path.join(this.outputDir, 'test-header-2023.csv');
    
    return new Promise((resolve, reject) => {
      console.log('Testing NCCS server connectivity...');
      console.log(`URL: ${testUrl}`);
      
      const request = https.get(testUrl, (response) => {
        console.log(`Response status: ${response.statusCode}`);
        console.log(`Response headers:`, response.headers);
        
        if (response.statusCode === 200) {
          const file = fs.createWriteStream(outputPath);
          let downloadedBytes = 0;
          
          response.on('data', (chunk) => {
            downloadedBytes += chunk.length;
          });
          
          response.pipe(file);
          
          file.on('finish', () => {
            file.close();
            console.log(`✅ Test download successful!`);
            console.log(`📁 File saved: ${outputPath}`);
            console.log(`📊 Downloaded: ${(downloadedBytes / 1024 / 1024).toFixed(2)} MB`);
            
            // Read first few lines to verify content
            this.previewFile(outputPath);
            resolve();
          });
        } else {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        }
      });
      
      request.on('error', (err) => {
        console.error('❌ Request error:', err.message);
        reject(err);
      });
      
      request.setTimeout(30000, () => {
        request.destroy();
        reject(new Error('Request timeout after 30 seconds'));
      });
    });
  }

  /**
   * Preview first few lines of downloaded file
   */
  private previewFile(filePath: string): void {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').slice(0, 5);
      
      console.log('\n📄 File preview (first 5 lines):');
      lines.forEach((line, index) => {
        console.log(`${index + 1}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
      });
      
      const totalLines = content.split('\n').length - 1;
      console.log(`\n📈 Total lines: ${totalLines}`);
      
      // Parse header to show available fields
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        console.log(`\n🏷️  Available fields (${headers.length}):`);
        headers.slice(0, 10).forEach(header => console.log(`   - ${header}`));
        if (headers.length > 10) {
          console.log(`   ... and ${headers.length - 10} more fields`);
        }
      }
      
    } catch (error) {
      console.error('Error previewing file:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Run the test
   */
  public async run(): Promise<void> {
    try {
      console.log('NCCS Data Fetcher - Test Mode\n');
      
      await this.testDownload();
      
      console.log('\n✅ Test completed successfully!');
      console.log('🚀 The NCCS data fetcher is ready to use.');
      console.log('\nNext steps:');
      console.log('1. Run full fetcher: npm run fetch-nccs');
      console.log('2. Check data quality in generated files');
      console.log('3. Proceed with data transformation');
      
    } catch (error) {
      console.error('\n❌ Test failed:', error instanceof Error ? error.message : String(error));
      console.log('\n🔍 Troubleshooting:');
      console.log('- Check internet connection');
      console.log('- Verify NCCS server is accessible');
      console.log('- Try again in a few minutes');
      process.exit(1);
    }
  }
}

// Run test
if (require.main === module) {
  const tester = new NCCSTestFetcher();
  tester.run();
}