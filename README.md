# AWS CloudWatch + SNS Visualizer

> **Build with Mayur** · An interactive, beginner-friendly AWS observability story.

Explore how Amazon EC2 metrics, Amazon CloudWatch alarms, and Amazon SNS notifications fit together. Follow Ravi, a small online shop owner, as CPU utilization rises to 95%, an alarm detects the condition, and a simulated email alert reaches his inbox.

**This is an educational simulation. It does not connect to AWS, read real metrics, trigger real alarms, or send email.**

## Architecture

```text
EC2 web server
    │ CPUUtilization metric
    ▼
Amazon CloudWatch
    │ evaluates configured threshold and periods
    ▼
CloudWatch Alarm
    │ alarm action publishes to topic
    ▼
Amazon SNS topic
    │ confirmed email subscription
    ▼
Ravi's inbox
```

## Features

- Animated AWS-inspired service pipeline with signal particles.
- CPU chart and threshold marker at 80%.
- Eight story chapters, previous/next navigation, Auto Play, pause, and reset.
- Trigger High CPU, Resolve Issue, and Test SNS Notification simulation controls.
- Beginner and DevOps explanation modes.
- Operations terminal with event messages.
- AWS CLI examples with copy buttons.
- Responsive layout, keyboard navigation, and reduced-motion support.
- No framework, backend, build step, or credentials required.

## Project structure

```text
aws-cloudwatch-sns-visual/
├── index.html
├── style.css
├── script.js
├── README.md
├── LICENSE
└── assets/
    └── favicon.svg
```

## Run locally

### Option A — Open directly
Open `index.html` in a modern browser.

### Option B — VS Code Live Server
1. Open the project folder in Visual Studio Code.
2. Install the Live Server extension if needed.
3. Right-click `index.html` and choose **Open with Live Server**.

### Option C — Python local server
From the project folder, run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Try the story

1. Click **Start story** or **Auto play**.
2. Watch CPU move through 25%, 50%, 75%, and 95%.
3. At 95%, observe the simulated alarm and SNS alert.
4. Click **Resolve issue** to simulate CPU returning to 30%.
5. Switch between Beginner and DevOps modes.
6. Open **Show commands** to explore real AWS CLI examples.

## AWS CLI examples

Replace all placeholders and use the correct AWS region. Install and configure AWS CLI v2 using your organization's approved method. Prefer IAM roles or temporary credentials; never commit access keys to source control.

### 1. List alarms

```bash
aws cloudwatch describe-alarms --region YOUR_AWS_REGION
```

### 2. List EC2 CPU metrics

```bash
aws cloudwatch list-metrics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --region YOUR_AWS_REGION
```

### 3. Create an SNS topic

```bash
aws sns create-topic \
  --name RaviShopAlerts \
  --region YOUR_AWS_REGION
```

Save the returned topic ARN as `YOUR_SNS_TOPIC_ARN`.

### 4. Subscribe an email endpoint

```bash
aws sns subscribe \
  --topic-arn YOUR_SNS_TOPIC_ARN \
  --protocol email \
  --notification-endpoint YOUR_EMAIL_ADDRESS \
  --region YOUR_AWS_REGION
```

Open the confirmation email and confirm the subscription before expecting email notifications.

### 5. Publish a test message

```bash
aws sns publish \
  --topic-arn YOUR_SNS_TOPIC_ARN \
  --subject "Ravi Shop test alert" \
  --message "This is a test notification." \
  --region YOUR_AWS_REGION
```

### 6. Create a CPU alarm

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name RaviShop-HighCPU \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=YOUR_EC2_INSTANCE_ID \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --datapoints-to-alarm 2 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions YOUR_SNS_TOPIC_ARN \
  --ok-actions YOUR_SNS_TOPIC_ARN \
  --region YOUR_AWS_REGION
```

This example requires two out of two 5-minute datapoints to be above the threshold before the alarm enters ALARM. The `--ok-actions` option requests a notification when the alarm transitions back to OK. Select periods and evaluation settings appropriate to your monitoring design.

## Permissions and real-world notes

The identity running the commands needs appropriate permissions for the actions used, such as CloudWatch alarm/metric read and write operations and SNS topic/subscription/publish operations. Review least-privilege IAM policies for your account and deployment process.

CloudWatch must be allowed to publish alarm notifications to the SNS topic. Ensure the topic policy permits the appropriate CloudWatch alarm service to publish, scoped to your account and region where practical. If a notification action is not working, check the alarm history, topic policy, subscription confirmation, and region.

EC2 publishes basic CPU metrics to CloudWatch by default. Basic monitoring commonly provides five-minute metric periods; detailed monitoring can provide one-minute periods. Alarm evaluation depends on the metric data available and the period/evaluation settings. A single high reading does not necessarily trigger an alarm immediately, and recovery depends on subsequent metric data.

**Safety:** Do not put AWS access keys, session tokens, passwords, or sensitive account information in this project, README, browser code, or GitHub. The frontend intentionally contains no AWS credentials and makes no AWS API calls.

## Screenshots

Add screenshots after running the project:

- `docs/screenshots/dashboard.png` — Main dashboard
- `docs/screenshots/alarm-state.png` — High CPU simulation
- `docs/screenshots/commands.png` — AWS CLI command panel

## Future improvements

- Optional live integration through a secured backend or AWS-hosted frontend with appropriate identity controls.
- Additional alarm metrics such as network traffic and status checks.
- More notification channels and incident-response runbooks.
- Downloadable event history and custom threshold settings.

## License

MIT. See [`LICENSE`](LICENSE).

## GitHub topics

`aws` `amazon-cloudwatch` `amazon-sns` `ec2` `devops` `cloud-monitoring` `observability` `html` `css` `javascript` `learning-project`

## Hashtags

#AWS #CloudWatch #AmazonSNS #CloudComputing #DevOps #CloudEngineer #Monitoring #BuildWithMayur
