import { supabase } from '@/lib/supabase/client';
import { PaddleSubscription } from './types';

/**
 * Database operations for Paddle integration
 */
export const paddleDb = {
  /**
   * Add or update a subscription record
   */
  async upsertSubscription(subscription: PaddleSubscription) {
    const { data, error } = await supabase.from('subscriptions').upsert(
      {
        id: subscription.id,
        customer_id: subscription.customer_id,
        product_id: subscription.product_id,
        status: subscription.status,
        created_at: subscription.create_time,
        updated_at: subscription.update_time,
        next_bill_date: subscription.next_billed_at || null,
        price_amount: subscription.price?.unit_price.amount || null,
        price_currency: subscription.price?.unit_price.currency_code || null,
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.error('Error upserting subscription:', error);
      throw error;
    }

    return data;
  },

  /**
   * Update subscription status
   */
  async updateSubscriptionStatus(subscriptionId: string, status: string) {
    const { error } = await supabase
      .from('subscriptions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', subscriptionId);

    if (error) {
      console.error('Error updating subscription status:', error);
      throw error;
    }
  },

  /**
   * Enroll user in a course
   */
  async enrollUser(customerId: string, productId: string, subscriptionId: string) {
    // First, find the user ID from customer ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('customer_id', customerId)
      .single();

    if (userError) {
      console.error('Error finding user by customer ID:', userError);
      throw userError;
    }

    const userId = userData.id;

    // Then find the course ID from product ID
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('product_id', productId)
      .single();

    if (courseError) {
      console.error('Error finding course by product ID:', courseError);
      throw courseError;
    }

    const courseId = courseData.id;

    // Finally, create the enrollment
    const { error: enrollError } = await supabase.from('enrollments').upsert(
      {
        user_id: userId,
        course_id: courseId,
        subscription_id: subscriptionId,
        status: 'active',
        enrolled_at: new Date().toISOString(),
      },
      { onConflict: 'user_id, course_id' }
    );

    if (enrollError) {
      console.error('Error creating enrollment:', enrollError);
      throw enrollError;
    }
  },

  /**
   * Remove user enrollment (e.g., when subscription is canceled)
   */
  async removeUserEnrollment(customerId: string, productId: string) {
    // Find the user ID from customer ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('customer_id', customerId)
      .single();

    if (userError) {
      console.error('Error finding user by customer ID:', userError);
      throw userError;
    }

    const userId = userData.id;

    // Find the course ID from product ID
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('product_id', productId)
      .single();

    if (courseError) {
      console.error('Error finding course by product ID:', courseError);
      throw courseError;
    }

    const courseId = courseData.id;

    // Update enrollment status to inactive
    const { error: enrollError } = await supabase
      .from('enrollments')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString(),
      })
      .match({ user_id: userId, course_id: courseId });

    if (enrollError) {
      console.error('Error updating enrollment:', enrollError);
      throw enrollError;
    }
  },

  /**
   * Get all subscriptions for a customer
   */
  async getCustomerSubscriptions(customerId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, courses(*)')
      .eq('customer_id', customerId);

    if (error) {
      console.error('Error getting customer subscriptions:', error);
      throw error;
    }

    return data;
  },

  /**
   * Check if user is enrolled in a course
   */
  async isUserEnrolled(userId: string, courseId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select('status')
      .match({ user_id: userId, course_id: courseId, status: 'active' })
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned"
      console.error('Error checking enrollment status:', error);
      throw error;
    }

    return !!data;
  },
};
