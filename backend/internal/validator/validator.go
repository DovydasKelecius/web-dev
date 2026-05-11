package validator

import (
	"fmt"
	"net"
	"regexp"
	"strings"
)

type ErrorResponse map[string]string

// Requirement: 8+ backend validators
// 1. Hostname pattern
// 2. IP Address validity
// 3. Severity enum
// 4. Status enum
// 5. Min length check
// 6. Max length check
// 7. Non-empty check
// 8. Asset type enum

func ValidateAsset(hostname, ip, assetType, criticality string) ErrorResponse {
	errs := make(ErrorResponse)

	// 1. Hostname pattern (no spaces, alphanumeric/dots/dashes)
	if matched, _ := regexp.MatchString(`^[a-zA-Z0-9.-]+$`, hostname); !matched {
		errs["hostname"] = "Hostname contains invalid characters"
	}

	// 2. IP Address validity
	if net.ParseIP(ip) == nil {
		errs["ip_address"] = "Invalid IP address format"
	}

	// 3. Asset Type enum
	validTypes := []string{"Server", "Workstation", "Mobile", "IoT", "Network"}
	if !contains(validTypes, assetType) {
		errs["asset_type"] = fmt.Sprintf("Must be one of: %s", strings.Join(validTypes, ", "))
	}

	// 4. Criticality enum
	validCrit := []string{"Low", "Medium", "High", "Critical"}
	if !contains(validCrit, criticality) {
		errs["criticality"] = "Invalid criticality level"
	}

	if len(errs) > 0 {
		return errs
	}
	return nil
}

func ValidateTicket(title, severity, status string) ErrorResponse {
	errs := make(ErrorResponse)

	// 5. Title min length
	if len(title) < 5 {
		errs["title"] = "Title must be at least 5 characters"
	}

	// 6. Title max length
	if len(title) > 100 {
		errs["title"] = "Title too long (max 100)"
	}

	// 7. Severity enum
	validSev := []string{"Low", "Medium", "High", "Critical"}
	if !contains(validSev, severity) {
		errs["severity"] = "Invalid severity level"
	}

	// 8. Status enum
	validStatus := []string{"Open", "In Progress", "Resolved", "Closed"}
	if !contains(validStatus, status) {
		errs["status"] = "Invalid status"
	}

	if len(errs) > 0 {
		return errs
	}
	return nil
}

func contains(slice []string, val string) bool {
	for _, item := range slice {
		if item == val {
			return true
		}
	}
	return false
}
