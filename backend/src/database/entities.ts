import { Appointment } from '../appointments/appointment.entity.js';
import { BankService } from '../bank-services/bank-service.entity.js';
import { Branch } from '../branches/branch.entity.js';

/** Every entity the data source knows about. */
export const ENTITIES = [Branch, BankService, Appointment];
