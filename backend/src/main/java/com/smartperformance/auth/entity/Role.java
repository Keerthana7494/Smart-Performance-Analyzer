package com.smartperformance.auth.entity;

/** Roles are assigned by trusted backend workflows, never by public signup input. */
public enum Role {
    ADMIN,
    TRAINER,
    STUDENT
}
