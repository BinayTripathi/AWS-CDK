#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkLearnStack } from '../lib/cdk-learn-stack';

const app = new cdk.App();
new CdkLearnStack(app, 'CdkLearnStack');
