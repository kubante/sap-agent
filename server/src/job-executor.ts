import { JOB_STATUS } from "./constants";
import { serviceRegistry } from "./services/service-registry";
import { Job } from "./types";
/**
 * Executes a job by validating data and fetching results using the appropriate service
 * Mutates the job object !!
 * @param job - The job to execute
 */
export async function executeJob(job: Job): Promise<void> {
  try {
    console.log(`Executing job ${job.id} (${job.name}) of type ${job.type}`);

    // Update job status to indicate execution started
    job.status = JOB_STATUS.SCHEDULED; // Keep as scheduled while executing

    // Get the appropriate service based on job type
    const service = serviceRegistry.getService(job.type);
    if (!service) {
      console.error(`Job ${job.id} failed: Unknown service type "${job.type}"`);
      job.status = JOB_STATUS.FAILED;
      return;
    }

    // Validate request data using the appropriate service
    const validationResult = service.validate(job.data);

    if (!validationResult.isValid) {
      console.error(
        `Job ${job.id} validation failed:`,
        validationResult.errors
      );
      job.status = JOB_STATUS.FAILED;
      return;
    }

    // Fetch data using the appropriate service
    console.log(`Fetching ${job.type} data for job ${job.id}`);
    const fetchedData = await service.fetchData(
      validationResult.processedData!
    );

    // Update job with fetched data and mark as completed
    job.data = fetchedData || undefined;
    job.status = JOB_STATUS.COMPLETED;

    console.log(`Job ${job.id} completed successfully`);
  } catch (error) {
    console.error(`Job ${job.id} execution failed:`, error);
    job.status = JOB_STATUS.FAILED;
  }
}
