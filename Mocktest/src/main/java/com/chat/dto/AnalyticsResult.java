package com.chat.dto;
public record AnalyticsResult(
	    int stress,
	    int risk,
	    int confidence,
	    int readiness,
	    boolean showCalmUI,
	    boolean strategyWarning,
	    boolean mistakeRisk,
	    int warningTick
	) {}
