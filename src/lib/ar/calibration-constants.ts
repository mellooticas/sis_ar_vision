/**
 * calibration-constants.ts — Single source of truth for all AR calibration values.
 *
 * Adjust these values after testing on real devices with a pupilometer
 * to achieve the best measurement accuracy.
 */

// ---------------------------------------------------------------------------
// BIOLOGICAL CONSTANTS
// ---------------------------------------------------------------------------

/** Average human iris diameter in mm (range: 10.2 - 13.0) */
export const IRIS_DIAMETER_MM = 11.7

/** Average PD — male 64mm, female 62mm, combined 63mm */
export const PD_AVERAGE_MM = 63

/** PD practical range */
export const PD_MIN_MM = 54
export const PD_MAX_MM = 74

/** Credit card width (ISO 7810 ID-1) used for card calibration */
export const CREDIT_CARD_WIDTH_MM = 85.6

// ---------------------------------------------------------------------------
// FACE DETECTION / DISTANCE
// ---------------------------------------------------------------------------

/** Expected face-to-camera distance when face fills silhouette guide (mm) */
export const SILHOUETTE_EXPECTED_DEPTH_MM = 400

/** Tolerance for silhouette depth cross-validation (±15%) */
export const DEPTH_TOLERANCE = 0.15

/** Minimum acceptable distance (mm) — closer = low accuracy */
export const MIN_DISTANCE_MM = 250

/** Maximum acceptable distance (mm) — farther = low resolution */
export const MAX_DISTANCE_MM = 600

/** Optimal distance range for measurements */
export const OPTIMAL_DISTANCE_MIN_MM = 350
export const OPTIMAL_DISTANCE_MAX_MM = 450

// ---------------------------------------------------------------------------
// PD MEASUREMENT
// ---------------------------------------------------------------------------

/** Maximum head yaw (degrees) before rejecting PD measurement */
export const PD_MAX_YAW_DEG = 25

/** Number of samples for stabilized PD average */
export const PD_SAMPLE_COUNT = 20

/** Stability window: consecutive frames with stddev < this value */
export const PD_STABILITY_THRESHOLD = 1.0

/** Number of consecutive stable frames required */
export const PD_STABILITY_WINDOW = 5

/** Outlier rejection: samples beyond this many stddevs are discarded */
export const PD_OUTLIER_STDDEV = 2.0

// ---------------------------------------------------------------------------
// AR RENDERING
// ---------------------------------------------------------------------------

/** Lerp factor for smooth glasses motion (0 = no movement, 1 = instant) */
export const GLASSES_LERP_FACTOR = 0.3

/** Default scale multiplier for uncalibrated glasses models */
export const GLASSES_SCALE_HEURISTIC = 3.5

/** Calibrated scale multiplier for models with known frame width */
export const GLASSES_SCALE_CALIBRATED = 2.0

// ---------------------------------------------------------------------------
// FACE ANALYSIS
// ---------------------------------------------------------------------------

/** Minimum face area (% of frame) for reliable shape analysis */
export const MIN_FACE_AREA_PERCENT = 8

/** Maximum face area (% of frame) — too close for analysis */
export const MAX_FACE_AREA_PERCENT = 60

// ---------------------------------------------------------------------------
// CAMERA
// ---------------------------------------------------------------------------

/** Minimum FPS for acceptable AR experience */
export const MIN_FPS_ACCEPTABLE = 15

/** Target FPS for smooth experience */
export const TARGET_FPS = 30

/** Estimated focal length in pixels for 640px wide video (adjust per device) */
export const DEFAULT_FOCAL_LENGTH_PX = 640
