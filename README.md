# Event-Driven Image Processing System with AWS SQS and SNS

## Project Description
This project demonstrates the transition from a tightly coupled architecture to a decoupled, event-driven system using Amazon Web Services. The primary goal is to handle image processing tasks asynchronously, ensuring high availability and scalability by using message queuing and notification services.

## Lab Objectives Achieved
* Implementation of a decoupled architecture using Amazon SQS and Amazon SNS.
* Configuration of Amazon S3 bucket events to trigger automated workflows.
* Deployment of an Application Server that utilizes long-polling to consume messages from a queue.
* Real-time metadata tracking and status updates using Amazon DynamoDB.
* Automated email notifications for system events via SNS.

## Technical Architecture

### Phase 1: Tightly Coupled Design
The initial environment featured a synchronous connection between the Web Server and the Application Server. In this setup, the Web Server was dependent on the immediate availability of the Application Server to process images, creating a bottleneck and a single point of failure.

### Phase 2: Decoupled Architecture (Final Implementation)
The system was re-engineered to separate the tiers using a message-driven approach:
1. **S3 Upload:** When a user uploads an image, it is stored in an S3 bucket.
2. **SNS Notification:** S3 triggers an event that publishes a message to an SNS topic.
3. **SQS Fan-out:** The SNS topic pushes the message to an SQS queue while simultaneously sending an email notification.
4. **SQS Polling:** The Application Server polls the SQS queue independently. Once a message is retrieved, the server processes the image and deletes the message from the queue upon successful completion.

## Components and Services
* **Compute:** Amazon EC2 (Node.js)
* **Messaging:** Amazon Simple Queue Service (SQS) & Amazon Simple Notification Service (SNS)
* **Storage:** Amazon S3
* **Database:** Amazon DynamoDB
* **Library:** Sharp.js for image manipulation

## File Structure
* **app-server/index.js**: Express server hosting the polling control routes.
* **app-server/libs/polling.js**: Core logic for SQS message consumption and image transformation.
* **app-server/libs/config.js**: AWS resource configuration and endpoint mapping.

## Visual Documentation

### System Architecture - Phase 1
![Phase 1 Architecture](System-Architecture-Phase1.png)

### System Architecture - Phase 2 (Decoupled Flow)
![Phase 2 Architecture](System-Architecture-Phase2.png)


### Processing Evidence and UI
![SNS Email Notification](sns%20email.png)
![Application Interface](Image%20Tinter%20app.png)

---
*Verified Implementation of the Guided Lab: Building Decoupled Applications by Using Amazon SQS.*
