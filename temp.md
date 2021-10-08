CREATE TABLE `vendor_payment_detail` (
`id` bigint(20) NOT NULL AUTO_INCREMENT,
`vend_pymt_ref_id` bigint(20) DEFAULT NULL,
`purchase_ref_id` bigint(20) DEFAULT NULL,
`applied_amount` decimal(12,2) DEFAULT '0.00',
`createdAt` datetime DEFAULT NULL,
`updatedAt` datetime DEFAULT NULL,
`created_by` bigint(20) DEFAULT NULL,
`updated_by` bigint(20) DEFAULT NULL,
PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=124 DEFAULT CHARSET=latin1;
